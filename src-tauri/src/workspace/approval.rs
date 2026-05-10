use crate::workspace::errors::{WorkspaceError, WorkspaceErrorCode};
use crate::workspace::open::open_workspace;
use crate::workspace::types::{LedgerStatus, WorkspaceSummary};
use crate::workspace::validation::validate_workspace;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SuggestedEntry {
    pub statement_row_id: String,
    pub posted_date: String,
    pub description: String,
    pub source_account: String,
    pub source_amount: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApproveSuggestedEntryInput {
    pub workspace_root_path: String,
    pub statement_row_id: String,
    pub ledger_account: String,
}

pub fn get_suggested_entries(
    workspace_root_path: impl AsRef<Path>,
) -> Result<Vec<SuggestedEntry>, WorkspaceError> {
    let connection = Connection::open(
        workspace_root_path
            .as_ref()
            .join(".ledgerly")
            .join("ledgerly.sqlite"),
    )?;
    let mut statement = connection.prepare(
        "
        select id, posted_date, description, source_account, source_amount
        from statement_rows
        where status = 'pending'
        order by posted_date, description
        ",
    )?;
    let entries = statement
        .query_map([], |row| {
            Ok(SuggestedEntry {
                statement_row_id: row.get(0)?,
                posted_date: row.get(1)?,
                description: row.get(2)?,
                source_account: row.get(3)?,
                source_amount: row.get(4)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(entries)
}

pub fn approve_suggested_entry(
    input: ApproveSuggestedEntryInput,
) -> Result<WorkspaceSummary, WorkspaceError> {
    let root = Path::new(&input.workspace_root_path);
    let validation = validate_workspace(root)?;
    if validation.status == LedgerStatus::Invalid {
        return Err(WorkspaceError::new(
            WorkspaceErrorCode::InvalidLedger,
            "Approval is blocked while the Workspace is in Invalid Ledger State.",
        ));
    }
    ensure_ledger_account_exists(root, &input.ledger_account)?;

    let connection = Connection::open(root.join(".ledgerly").join("ledgerly.sqlite"))?;
    let suggested_entry = load_pending_suggested_entry(&connection, &input.statement_row_id)?;
    let source_amount = parse_amount(&suggested_entry.source_amount)?;
    let balancing_amount = -source_amount;

    let monthly_relative_path = monthly_transaction_file(&suggested_entry.posted_date)?;
    let monthly_path = root.join(&monthly_relative_path);
    if let Some(parent) = monthly_path.parent() {
        fs::create_dir_all(parent)?;
    }
    ensure_main_includes(root, &monthly_relative_path)?;
    append_approved_entry(
        &monthly_path,
        &suggested_entry,
        &input.ledger_account,
        balancing_amount,
    )?;

    connection.execute(
        "update statement_rows set status = 'accounted' where id = ?1",
        [input.statement_row_id],
    )?;

    open_workspace(root)
}

fn load_pending_suggested_entry(
    connection: &Connection,
    statement_row_id: &str,
) -> Result<SuggestedEntry, WorkspaceError> {
    connection
        .query_row(
            "
            select id, posted_date, description, source_account, source_amount
            from statement_rows
            where id = ?1 and status = 'pending'
            ",
            [statement_row_id],
            |row| {
                Ok(SuggestedEntry {
                    statement_row_id: row.get(0)?,
                    posted_date: row.get(1)?,
                    description: row.get(2)?,
                    source_account: row.get(3)?,
                    source_amount: row.get(4)?,
                })
            },
        )
        .map_err(|_| {
            WorkspaceError::new(
                WorkspaceErrorCode::InvalidLedger,
                "Suggested Entry is no longer pending.",
            )
        })
}

fn ensure_ledger_account_exists(root: &Path, ledger_account: &str) -> Result<(), WorkspaceError> {
    let accounts = fs::read_to_string(root.join("accounts.bean"))?;
    if accounts
        .lines()
        .any(|line| line.split_whitespace().nth(2) == Some(ledger_account))
    {
        return Ok(());
    }
    Err(WorkspaceError::new(
        WorkspaceErrorCode::InvalidLedger,
        "Approval requires an existing Ledger Account.",
    ))
}

fn parse_amount(value: &str) -> Result<f64, WorkspaceError> {
    value.parse::<f64>().map_err(|_| {
        WorkspaceError::new(
            WorkspaceErrorCode::InvalidLedger,
            "Suggested Entry amount must be numeric.",
        )
    })
}

fn monthly_transaction_file(posted_date: &str) -> Result<String, WorkspaceError> {
    if posted_date.len() < 7 {
        return Err(WorkspaceError::new(
            WorkspaceErrorCode::InvalidLedger,
            "Suggested Entry posted date must be ISO formatted.",
        ));
    }
    Ok(format!("transactions/{}.bean", &posted_date[..7]))
}

fn ensure_main_includes(root: &Path, monthly_relative_path: &str) -> Result<(), WorkspaceError> {
    let main_path = root.join("main.bean");
    let include = format!("include \"{monthly_relative_path}\"");
    let main = fs::read_to_string(&main_path)?;
    if main.contains(&include) {
        return Ok(());
    }
    let mut file = OpenOptions::new().append(true).open(main_path)?;
    writeln!(file, "{include}").map_err(WorkspaceError::from)
}

fn append_approved_entry(
    monthly_path: &Path,
    suggested_entry: &SuggestedEntry,
    ledger_account: &str,
    balancing_amount: f64,
) -> Result<(), WorkspaceError> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(monthly_path)?;
    writeln!(
        file,
        "\n{} * \"{}\"\n  {}  {} USD\n  {}  {:.2} USD",
        suggested_entry.posted_date,
        suggested_entry.description,
        suggested_entry.source_account,
        suggested_entry.source_amount,
        ledger_account,
        balancing_amount
    )
    .map_err(WorkspaceError::from)
}

#[cfg(test)]
mod tests {
    use crate::workspace::approval::{
        approve_suggested_entry, get_suggested_entries, ApproveSuggestedEntryInput,
    };
    use crate::workspace::create::create_workspace;
    use crate::workspace::imports::{import_statement_rows, CsvImportInput, CsvSourceMappingInput};
    use crate::workspace::source_accounts::{
        add_source_account, AddSourceAccountInput, SourceAccountKind,
    };
    use crate::workspace::types::{CreateWorkspaceInput, LedgerStatus};
    use rusqlite::Connection;
    use std::fs;
    use std::path::Path;

    #[test]
    fn approves_non_transfer_suggested_entry_into_monthly_transaction_file() {
        let tempdir = tempfile::tempdir().unwrap();
        let created = create_workspace(CreateWorkspaceInput {
            business_name: "Acme Studio".to_string(),
            base_currency: "USD".to_string(),
            books_start_date: "2026-01-01".to_string(),
            parent_directory: tempdir.path().to_string_lossy().to_string(),
        })
        .unwrap();
        add_source_account(AddSourceAccountInput {
            workspace_root_path: created.root_path.clone(),
            kind: SourceAccountKind::Bank,
            name: "Operating Checking".to_string(),
            opening_balance: None,
        })
        .unwrap();
        import_statement_rows(CsvImportInput {
            workspace_root_path: created.root_path.clone(),
            source_account: "Assets:Bank:Operating-Checking".to_string(),
            source_file_name: "checking.csv".to_string(),
            csv_contents: "Date,Description,Amount\n2026-01-04,Software,-29.99\n".to_string(),
            mapping: Some(CsvSourceMappingInput {
                posted_date_column: "Date".to_string(),
                description_column: "Description".to_string(),
                amount_column: "Amount".to_string(),
                memo_column: None,
                reference_id_column: None,
                payee_column: None,
                category_column: None,
            }),
        })
        .unwrap();

        let suggested_entries = get_suggested_entries(&created.root_path).unwrap();
        assert_eq!(suggested_entries.len(), 1);
        assert_eq!(suggested_entries[0].source_account, "Assets:Bank:Operating-Checking");
        assert_eq!(suggested_entries[0].source_amount, "-29.99");

        let summary = approve_suggested_entry(ApproveSuggestedEntryInput {
            workspace_root_path: created.root_path.clone(),
            statement_row_id: suggested_entries[0].statement_row_id.clone(),
            ledger_account: "Expenses:Software".to_string(),
        })
        .unwrap();

        assert_eq!(summary.ledger_status, LedgerStatus::Valid);

        let monthly_file = Path::new(&created.root_path).join("transactions/2026-01.bean");
        let contents = fs::read_to_string(monthly_file).unwrap();
        assert!(contents.contains("2026-01-04 * \"Software\""));
        assert!(contents.contains("Assets:Bank:Operating-Checking  -29.99 USD"));
        assert!(contents.contains("Expenses:Software  29.99 USD"));

        let connection = Connection::open(
            Path::new(&created.root_path)
                .join(".ledgerly")
                .join("ledgerly.sqlite"),
        )
        .unwrap();
        let status: String = connection
            .query_row("select status from statement_rows", [], |row| row.get(0))
            .unwrap();
        assert_eq!(status, "accounted");
    }

    #[test]
    fn blocks_approval_during_invalid_ledger_state() {
        let tempdir = tempfile::tempdir().unwrap();
        let created = create_workspace(CreateWorkspaceInput {
            business_name: "Acme Studio".to_string(),
            base_currency: "USD".to_string(),
            books_start_date: "2026-01-01".to_string(),
            parent_directory: tempdir.path().to_string_lossy().to_string(),
        })
        .unwrap();
        add_source_account(AddSourceAccountInput {
            workspace_root_path: created.root_path.clone(),
            kind: SourceAccountKind::Bank,
            name: "Operating Checking".to_string(),
            opening_balance: None,
        })
        .unwrap();
        import_statement_rows(CsvImportInput {
            workspace_root_path: created.root_path.clone(),
            source_account: "Assets:Bank:Operating-Checking".to_string(),
            source_file_name: "checking.csv".to_string(),
            csv_contents: "Date,Description,Amount\n2026-01-04,Software,-29.99\n".to_string(),
            mapping: Some(CsvSourceMappingInput {
                posted_date_column: "Date".to_string(),
                description_column: "Description".to_string(),
                amount_column: "Amount".to_string(),
                memo_column: None,
                reference_id_column: None,
                payee_column: None,
                category_column: None,
            }),
        })
        .unwrap();
        let suggested_entries = get_suggested_entries(&created.root_path).unwrap();
        fs::write(
            Path::new(&created.root_path).join("accounts.bean"),
            "not valid ledger content\n",
        )
        .unwrap();

        let error = approve_suggested_entry(ApproveSuggestedEntryInput {
            workspace_root_path: created.root_path,
            statement_row_id: suggested_entries[0].statement_row_id.clone(),
            ledger_account: "Expenses:Software".to_string(),
        })
        .unwrap_err();

        assert_eq!(error.code, crate::workspace::WorkspaceErrorCode::InvalidLedger);
    }
}
