pub mod commands;
pub mod workspace;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::workspace::create_workspace,
            commands::workspace::open_workspace,
            commands::workspace::validate_workspace,
            commands::workspace::add_source_account,
            commands::workspace::import_statement_rows,
            commands::workspace::get_suggested_entries,
            commands::workspace::approve_suggested_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ledgerly");
}
