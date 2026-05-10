use crate::workspace::errors::{WorkspaceError, WorkspaceErrorCode};
use crate::workspace::paths::validate_books_start_date;
use crate::workspace::types::{LedgerStatus, LedgerValidationSummary};
use std::fs;
use std::path::Path;

pub fn validate_workspace(path: impl AsRef<Path>) -> Result<LedgerValidationSummary, WorkspaceError> {
    let root = path.as_ref();
    let mut errors = Vec::new();

    let main_path = root.join("main.bean");
    let accounts_path = root.join("accounts.bean");
    let opening_balances_path = root.join("opening-balances.bean");

    if !main_path.exists() {
        errors.push("Missing main.bean.".to_string());
    }
    if !accounts_path.exists() {
        errors.push("Missing accounts.bean.".to_string());
    }
    if !opening_balances_path.exists() {
        errors.push("Missing opening-balances.bean.".to_string());
    }

    if errors.is_empty() {
        let main = fs::read_to_string(&main_path)?;
        if !main.contains("include \"accounts.bean\"") {
            errors.push("main.bean must include accounts.bean.".to_string());
        }
        if !main.contains("include \"opening-balances.bean\"") {
            errors.push("main.bean must include opening-balances.bean.".to_string());
        }

        let accounts = fs::read_to_string(&accounts_path)?;
        for (line_number, line) in accounts.lines().enumerate() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with(';') {
                continue;
            }

            let parts = trimmed.split_whitespace().collect::<Vec<_>>();
            if parts.len() != 4 || parts[1] != "open" {
                errors.push(format!("Invalid account open directive on line {}.", line_number + 1));
                continue;
            }
            if validate_books_start_date(parts[0]).is_err() {
                errors.push(format!("Invalid date on line {}.", line_number + 1));
            }
            if !is_valid_account_name(parts[2]) {
                errors.push(format!("Invalid account name on line {}.", line_number + 1));
            }
            if parts[3] != "USD" {
                errors.push(format!("Invalid currency on line {}.", line_number + 1));
            }
        }
    }

    Ok(LedgerValidationSummary {
        status: if errors.is_empty() {
            LedgerStatus::Valid
        } else {
            LedgerStatus::Invalid
        },
        errors,
    })
}

pub fn ensure_valid_workspace(path: impl AsRef<Path>) -> Result<LedgerValidationSummary, WorkspaceError> {
    let summary = validate_workspace(path)?;
    if summary.status == LedgerStatus::Invalid {
        return Err(WorkspaceError::new(
            WorkspaceErrorCode::InvalidLedger,
            summary.errors.join(" "),
        ));
    }
    Ok(summary)
}

fn is_valid_account_name(value: &str) -> bool {
    let roots = ["Assets", "Liabilities", "Equity", "Income", "Expenses"];
    let mut parts = value.split(':');
    let Some(root) = parts.next() else {
        return false;
    };
    roots.contains(&root)
        && parts.clone().count() > 0
        && parts.all(|part| {
            !part.is_empty()
                && part
                    .chars()
                    .all(|character| character.is_ascii_alphanumeric() || character == '-')
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::create::create_workspace;
    use crate::workspace::types::CreateWorkspaceInput;

    #[test]
    fn generated_workspace_validates() {
        let tempdir = tempfile::tempdir().unwrap();
        let summary = create_workspace(CreateWorkspaceInput {
            business_name: "Acme Studio".to_string(),
            base_currency: "USD".to_string(),
            books_start_date: "2026-01-01".to_string(),
            parent_directory: tempdir.path().to_string_lossy().to_string(),
        })
        .unwrap();

        let validation = validate_workspace(summary.root_path).unwrap();
        assert_eq!(validation.status, LedgerStatus::Valid);
        assert!(validation.errors.is_empty());
    }

    #[test]
    fn missing_accounts_file_is_invalid() {
        let tempdir = tempfile::tempdir().unwrap();
        let summary = create_workspace(CreateWorkspaceInput {
            business_name: "Acme Studio".to_string(),
            base_currency: "USD".to_string(),
            books_start_date: "2026-01-01".to_string(),
            parent_directory: tempdir.path().to_string_lossy().to_string(),
        })
        .unwrap();
        fs::remove_file(Path::new(&summary.root_path).join("accounts.bean")).unwrap();

        let validation = validate_workspace(summary.root_path).unwrap();
        assert_eq!(validation.status, LedgerStatus::Invalid);
        assert!(validation.errors.iter().any(|error| error.contains("accounts.bean")));
    }

    #[test]
    fn corrupted_account_directive_is_invalid() {
        let tempdir = tempfile::tempdir().unwrap();
        let summary = create_workspace(CreateWorkspaceInput {
            business_name: "Acme Studio".to_string(),
            base_currency: "USD".to_string(),
            books_start_date: "2026-01-01".to_string(),
            parent_directory: tempdir.path().to_string_lossy().to_string(),
        })
        .unwrap();
        fs::write(
            Path::new(&summary.root_path).join("accounts.bean"),
            "2026-01-01 nope Assets:Bank:Checking USD\n",
        )
        .unwrap();

        let validation = validate_workspace(summary.root_path).unwrap();
        assert_eq!(validation.status, LedgerStatus::Invalid);
    }
}
