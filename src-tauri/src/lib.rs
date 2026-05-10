pub mod commands;
pub mod workspace;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::workspace::create_workspace,
            commands::workspace::open_workspace,
            commands::workspace::validate_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ledgerly");
}
