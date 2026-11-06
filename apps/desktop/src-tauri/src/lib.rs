// ByteKnife para Mac. La app no tiene telemetría: las únicas conexiones que abre por su
// cuenta son las del updater (GitHub Releases). Las llamadas HTTP del cliente (F7) las
// arma el usuario y salen directo a su destino con tauri-plugin-http.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("no se pudo iniciar ByteKnife");
}
