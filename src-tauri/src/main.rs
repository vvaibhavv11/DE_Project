// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ocr;
use email::email::send_email;
use ocr::ocr::extracted_text;
mod email;

#[tauri::command(rename_all = "snake_case")]
fn text_from_image(image: Vec<u8>) -> String {
    match extracted_text(&image) {
        Ok(text) => text,
        Err(e) => e.to_string()
    }
}

#[tauri::command(rename_all = "snake_case")]
fn semail(sender_email: &str, mess: &str) -> bool {
    match send_email(sender_email, mess) {
        Ok(_) => true,
        Err(e) => {
            println!("{}", e.to_string());
            false
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![text_from_image, semail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
