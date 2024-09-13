use std::result::Result;
use std::u8;

use tokio::task;
use tesseract::{Tesseract, TesseractError};
use tesseract::OcrEngineMode;

pub async fn extracted_text(image: &[u8]) -> Result<String, TesseractError> {
    task::block_in_place(move || {
        let text = Tesseract::new_with_oem(None, Some("eng"), OcrEngineMode::Default);
        match text {
            Ok(ima) => {
                match ima.set_image_from_mem(image) {
                    Ok(i) => {
                        match i.recognize() {
                            Ok(mut j) => {
                                match j.get_text() {
                                    Ok(k) => Ok(k),
                                    Err(e) => Err(TesseractError::GetTextError(e))
                                }
                            },
                            Err(e) => Err(TesseractError::RecognizeError(e))
                        }
                    },
                    Err(e) => Err(TesseractError::SetImgFromMemError(e))
                }
            },
            Err(e) => Err(TesseractError::InitializeError(e))
        }
    })
}

