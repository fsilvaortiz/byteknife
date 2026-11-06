// Sin consola extra en Windows en release (cuando haya versión para Windows).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    byteknife_lib::run()
}
