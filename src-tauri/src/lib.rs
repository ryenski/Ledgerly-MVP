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
            commands::workspace::get_broken_provenance,
            commands::workspace::approve_suggested_entry,
            commands::workspace::approve_transfer_entry,
            commands::workspace::list_categorization_rules,
            commands::workspace::create_categorization_rule,
            commands::workspace::update_categorization_rule,
            commands::workspace::get_ai_adapter_config,
            commands::workspace::configure_ai_adapter,
            commands::workspace::get_ai_context_disclosure,
            commands::workspace::get_mvp_reports
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ledgerly");
}
