export type WorkspaceCreateInput = {
  businessName: string;
  baseCurrency: "USD";
  booksStartDate: string;
  parentDirectory: string;
};

export type SourceAccountKind = "bank" | "creditCard";

export type AddSourceAccountInput = {
  workspaceRootPath: string;
  kind: SourceAccountKind;
  name: string;
  openingBalance?: string | null;
};

export type CsvSourceMappingInput = {
  postedDateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  memoColumn?: string | null;
  referenceIdColumn?: string | null;
  payeeColumn?: string | null;
  categoryColumn?: string | null;
};

export type CsvImportInput = {
  workspaceRootPath: string;
  sourceAccount: string;
  sourceFileName: string;
  csvContents: string;
  mapping?: CsvSourceMappingInput | null;
};

export type CsvImportResult = {
  sourceAccount: string;
  importedCount: number;
  skippedDuplicateCount: number;
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
