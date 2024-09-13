#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ocr;
use email::email::send_email;
use ocr::ocr::extracted_text;
mod email;

#[tauri::command(rename_all = "snake_case")]
async fn text_from_image(image: Vec<u8>) -> String {
    match extracted_text(&image).await {
        Ok(text) => text,
        Err(e) => e.to_string()
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn semail(sender_email: &str, mess: &str) -> Result<bool, bool> {
    match send_email(sender_email, mess).await {
        Ok(_) => Ok(true),
        Err(e) => {
            println!("{}", e.to_string());
            Err(false)
        }
    }
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![text_from_image, semail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
