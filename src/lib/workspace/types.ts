export type WorkspaceCreateInput = {
  businessName: string;
  baseCurrency: "USD";
  booksStartDate: string;
  parentDirectory: string;
};

export type WorkspaceManifest = {
  schemaVersion: 1;
  appCreated: true;
  business: {
    name: string;
    baseCurrency: "USD";
    booksStartDate: string;
  };
  layout: {
    mainFile: "main.bean";
    accountsFile: "accounts.bean";
    openingBalancesFile: "opening-balances.bean";
    transactionsDirectory: "transactions";
    documentsDirectory: "documents";
    importsDirectory: "imports";
    appDirectory: ".ledgerly";
    sqliteFile: ".ledgerly/ledgerly.sqlite";
  };
  createdAt: string;
  updatedAt: string;
};

export type LedgerStatus = "valid" | "invalid";

export type WorkspaceSummary = {
  rootPath: string;
  businessName: string;
  baseCurrency: "USD";
  booksStartDate: string;
  ledgerStatus: LedgerStatus;
  ledgerValidation: LedgerValidationSummary;
};

export type LedgerValidationSummary = {
  status: LedgerStatus;
  errors: string[];
};

export type WorkspaceErrorCode =
  | "invalidBusinessName"
  | "invalidBooksStartDate"
  | "invalidCurrency"
  | "directoryAlreadyExists"
  | "notAppCreatedWorkspace"
  | "missingManifest"
  | "missingLedgerFile"
  | "invalidLedger"
  | "io"
  | "sqlite";

export type WorkspaceError = {
  code: WorkspaceErrorCode;
  message: string;
};
