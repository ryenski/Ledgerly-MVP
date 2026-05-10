use crate::workspace::errors::{WorkspaceError, WorkspaceErrorCode};
use crate::workspace::types::WorkspaceManifest;
use chrono::Utc;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvImportInput {
    pub workspace_root_path: String,
    pub source_account: String,
    pub source_file_name: String,
    pub csv_contents: String,
    pub mapping: Option<CsvSourceMappingInput>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvSourceMappingInput {
    pub posted_date_column: String,
    pub description_column: String,
    pub amount_column: String,
    pub memo_column: Option<String>,
    pub reference_id_column: Option<String>,
    pub payee_column: Option<String>,
    pub category_column: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvImportResult {
    pub source_account: String,
    pub imported_count: usize,
}

pub fn import_statement_rows(input: CsvImportInput) -> Result<CsvImportResult, WorkspaceError> {
    let root = Path::new(&input.workspace_root_path);
    ensure_app_created_workspace(root)?;
    ensure_source_account_exists(root, &input.source_account)?;

    let rows = parse_csv(&input.csv_contents)?;
    if rows.is_empty() {
        return Ok(CsvImportResult {
            source_account: input.source_account,
            imported_count: 0,
        });
    }

    let sqlite_path = root.join(".ledgerly").join("ledgerly.sqlite");
    let connection = Connection::open(sqlite_path)?;
    ensure_import_tables(&connection)?;
    let mapping = match input.mapping {
        Some(mapping) => {
            save_source_mapping(&connection, &input.source_account, &mapping)?;
            mapping
        }
        None => load_source_mapping(&connection, &input.source_account)?,
    };

    let mut imported_count = 0;
    let now = Utc::now().to_rfc3339();

    for row in rows {
        let posted_date = required_value(&row, &mapping.posted_date_column)?;
        let description = required_value(&row, &mapping.description_column)?;
        let source_amount = required_amount(&row, &mapping.amount_column)?;
        let raw_row_json =
            serde_json::to_string(&row).map_err(|error| WorkspaceError::io(error.to_string()))?;
        let supporting_fields_json = serde_json::to_string(&json!({
            "memo": optional_value(&row, mapping.memo_column.as_deref()),
            "referenceId": optional_value(&row, mapping.reference_id_column.as_deref()),
            "payee": optional_value(&row, mapping.payee_column.as_deref()),
            "category": optional_value(&row, mapping.category_column.as_deref()),
        }))
        .map_err(|error| WorkspaceError::io(error.to_string()))?;

        connection.execute(
            "
            insert into statement_rows (
              id,
              source_account,
              source_file_name,
              posted_date,
              description,
              source_amount,
              supporting_fields_json,
              raw_row_json,
              status,
              imported_at
            ) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'pending', ?9)
            ",
            params![
                Uuid::new_v4().to_string(),
                input.source_account,
                input.source_file_name,
                posted_date,
                description,
                source_amount,
                supporting_fields_json,
                raw_row_json,
                now
            ],
        )?;
        imported_count += 1;
    }

    Ok(CsvImportResult {
        source_account: input.source_account,
        imported_count,
    })
}

fn ensure_app_created_workspace(root: &Path) -> Result<WorkspaceManifest, WorkspaceError> {
    let manifest_path = root.join(".ledgerly").join("workspace.json");
    let manifest: WorkspaceManifest =
        serde_json::from_str(&fs::read_to_string(manifest_path)?).map_err(|_| {
            WorkspaceError::new(
                WorkspaceErrorCode::NotAppCreatedWorkspace,
                "Workspace manifest is unreadable.",
            )
        })?;
    if !manifest.app_created {
        return Err(WorkspaceError::new(
            WorkspaceErrorCode::NotAppCreatedWorkspace,
            "Only App-Created Workspaces are supported in the MVP.",
        ));
    }
    Ok(manifest)
}

fn ensure_source_account_exists(root: &Path, source_account: &str) -> Result<(), WorkspaceError> {
    let accounts = fs::read_to_string(root.join("accounts.bean"))?;
    if accounts
        .lines()
        .any(|line| line.split_whitespace().nth(2) == Some(source_account))
    {
        return Ok(());
    }

    Err(WorkspaceError::new(
        WorkspaceErrorCode::InvalidLedger,
        "CSV Import must be tied to an existing Source Account.",
    ))
}

fn ensure_import_tables(connection: &Connection) -> Result<(), WorkspaceError> {
    connection.execute_batch(
        "
        create table if not exists source_mappings (
          source_account text primary key,
          mapping_json text not null,
          updated_at text not null
        );

        create table if not exists statement_rows (
          id text primary key,
          source_account text not null,
          source_file_name text not null,
          posted_date text not null,
          description text not null,
          source_amount text not null,
          supporting_fields_json text not null,
          raw_row_json text not null,
          status text not null,
          imported_at text not null
        );
        ",
    )?;
    Ok(())
}

fn save_source_mapping(
    connection: &Connection,
    source_account: &str,
    mapping: &CsvSourceMappingInput,
) -> Result<(), WorkspaceError> {
    let mapping_json =
        serde_json::to_string(mapping).map_err(|error| WorkspaceError::io(error.to_string()))?;
    connection.execute(
        "
        insert into source_mappings (source_account, mapping_json, updated_at)
        values (?1, ?2, ?3)
        on conflict(source_account) do update set
          mapping_json = excluded.mapping_json,
          updated_at = excluded.updated_at
        ",
        params![source_account, mapping_json, Utc::now().to_rfc3339()],
    )?;
    Ok(())
}

fn load_source_mapping(
    connection: &Connection,
    source_account: &str,
) -> Result<CsvSourceMappingInput, WorkspaceError> {
    let mapping_json: String = connection
        .query_row(
            "select mapping_json from source_mappings where source_account = ?1",
            [source_account],
            |row| row.get(0),
        )
        .map_err(|_| {
            WorkspaceError::new(
                WorkspaceErrorCode::InvalidLedger,
                "CSV Import needs a Source Mapping before it can reuse one.",
            )
        })?;
    serde_json::from_str(&mapping_json).map_err(|error| WorkspaceError::io(error.to_string()))
}

fn parse_csv(contents: &str) -> Result<Vec<HashMap<String, String>>, WorkspaceError> {
    let mut lines = contents.lines().filter(|line| !line.trim().is_empty());
    let Some(header_line) = lines.next() else {
        return Ok(Vec::new());
    };
    let headers = parse_csv_line(header_line);
    let mut rows = Vec::new();

    for line in lines {
        let values = parse_csv_line(line);
        let mut row = HashMap::new();
        for (index, header) in headers.iter().enumerate() {
            row.insert(header.clone(), values.get(index).cloned().unwrap_or_default());
        }
        rows.push(row);
    }

    Ok(rows)
}

fn parse_csv_line(line: &str) -> Vec<String> {
    line.split(',')
        .map(|value| value.trim().trim_matches('"').to_string())
        .collect()
}

fn required_value(row: &HashMap<String, String>, column: &str) -> Result<String, WorkspaceError> {
    row.get(column)
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            WorkspaceError::new(
                WorkspaceErrorCode::InvalidLedger,
                format!("CSV Import is missing required column value {column}."),
            )
        })
}

fn required_amount(row: &HashMap<String, String>, column: &str) -> Result<String, WorkspaceError> {
    let amount = required_value(row, column)?;
    amount.parse::<f64>().map_err(|_| {
        WorkspaceError::new(
            WorkspaceErrorCode::InvalidLedger,
            format!("CSV Import amount column {column} must contain numeric values."),
        )
    })?;
    Ok(amount)
}

fn optional_value(row: &HashMap<String, String>, column: Option<&str>) -> Option<String> {
    column.and_then(|column| row.get(column).map(|value| value.trim().to_string()))
}

#[cfg(test)]
mod tests {
    use crate::workspace::create::create_workspace;
    use crate::workspace::imports::{import_statement_rows, CsvImportInput, CsvSourceMappingInput};
    use crate::workspace::source_accounts::{
        add_source_account, AddSourceAccountInput, SourceAccountKind,
    };
    use crate::workspace::types::CreateWorkspaceInput;
    use rusqlite::Connection;

    #[test]
    fn imports_statement_rows_into_staging_with_source_mapping() {
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

        let result = import_statement_rows(CsvImportInput {
            workspace_root_path: created.root_path.clone(),
            source_account: "Assets:Bank:Operating-Checking".to_string(),
            source_file_name: "checking.csv".to_string(),
            csv_contents: "Date,Description,Amount,Memo\n2026-01-03,Client payment,1500.00,Invoice 42\n2026-01-04,Software,-29.99,Subscription\n".to_string(),
            mapping: Some(CsvSourceMappingInput {
                posted_date_column: "Date".to_string(),
                description_column: "Description".to_string(),
                amount_column: "Amount".to_string(),
                memo_column: Some("Memo".to_string()),
                reference_id_column: None,
                payee_column: None,
                category_column: None,
            }),
        })
        .unwrap();

        assert_eq!(result.imported_count, 2);
        assert_eq!(result.source_account, "Assets:Bank:Operating-Checking");

        let connection = Connection::open(
            std::path::Path::new(&created.root_path)
                .join(".ledgerly")
                .join("ledgerly.sqlite"),
        )
        .unwrap();
        let row_count: i64 = connection
            .query_row("select count(*) from statement_rows", [], |row| row.get(0))
            .unwrap();
        assert_eq!(row_count, 2);

        let saved_mapping_count: i64 = connection
            .query_row("select count(*) from source_mappings", [], |row| row.get(0))
            .unwrap();
        assert_eq!(saved_mapping_count, 1);

        let source_amount: String = connection
            .query_row(
                "select source_amount from statement_rows where description = 'Software'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(source_amount, "-29.99");

        let reused = import_statement_rows(CsvImportInput {
            workspace_root_path: created.root_path.clone(),
            source_account: "Assets:Bank:Operating-Checking".to_string(),
            source_file_name: "checking-next.csv".to_string(),
            csv_contents: "Date,Description,Amount,Memo\n2026-01-05,Refund,12.00,Returned fee\n"
                .to_string(),
            mapping: None,
        })
        .unwrap();

        assert_eq!(reused.imported_count, 1);
    }
}
