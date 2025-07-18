// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_note() -> String {
    let txt = "test";
    format!("Hello, You've saved that! This is a {}", txt)
}

#[tauri::command]
fn parse_markdown(txt: &str) -> String {
    format!("{}", markdown::to_html(txt))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_note, parse_markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
