use serde::Serialize;
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum WorkspaceErrorCode {
    InvalidBusinessName,
    InvalidBooksStartDate,
    InvalidCurrency,
    DirectoryAlreadyExists,
    NotAppCreatedWorkspace,
    MissingManifest,
    MissingLedgerFile,
    InvalidLedger,
    Io,
    Sqlite,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceError {
    pub code: WorkspaceErrorCode,
    pub message: String,
}

impl WorkspaceError {
    pub fn new(code: WorkspaceErrorCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }

    pub fn io(message: impl Into<String>) -> Self {
        Self::new(WorkspaceErrorCode::Io, message)
    }

    pub fn sqlite(message: impl Into<String>) -> Self {
        Self::new(WorkspaceErrorCode::Sqlite, message)
    }
}

impl fmt::Display for WorkspaceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.code_name(), self.message)
    }
}

impl WorkspaceError {
    fn code_name(&self) -> &'static str {
        match self.code {
            WorkspaceErrorCode::InvalidBusinessName => "InvalidBusinessName",
            WorkspaceErrorCode::InvalidBooksStartDate => "InvalidBooksStartDate",
            WorkspaceErrorCode::InvalidCurrency => "InvalidCurrency",
            WorkspaceErrorCode::DirectoryAlreadyExists => "DirectoryAlreadyExists",
            WorkspaceErrorCode::NotAppCreatedWorkspace => "NotAppCreatedWorkspace",
            WorkspaceErrorCode::MissingManifest => "MissingManifest",
            WorkspaceErrorCode::MissingLedgerFile => "MissingLedgerFile",
            WorkspaceErrorCode::InvalidLedger => "InvalidLedger",
            WorkspaceErrorCode::Io => "Io",
            WorkspaceErrorCode::Sqlite => "Sqlite",
        }
    }
}

impl std::error::Error for WorkspaceError {}

impl From<std::io::Error> for WorkspaceError {
    fn from(value: std::io::Error) -> Self {
        Self::io(value.to_string())
    }
}

impl From<rusqlite::Error> for WorkspaceError {
    fn from(value: rusqlite::Error) -> Self {
        Self::sqlite(value.to_string())
    }
}
