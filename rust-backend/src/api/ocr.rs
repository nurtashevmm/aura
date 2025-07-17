use actix_web::{web, HttpResponse, Result};
use actix_multipart::Multipart;
use futures_util::TryStreamExt;
use serde::{Deserialize, Serialize};
use std::io::Write;
use tempfile::NamedTempFile;

#[derive(Serialize, Deserialize)]
pub struct OCRResponse {
    pub success: bool,
    pub text: Option<String>,
    pub amount: Option<f64>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct KaspiReceiptData {
    pub amount: f64,
    pub merchant: Option<String>,
    pub date: Option<String>,
    pub transaction_id: Option<String>,
}

pub async fn upload_receipt(mut payload: Multipart) -> Result<HttpResponse> {
    // Process multipart form data
    while let Some(mut field) = payload.try_next().await? {
        let content_disposition = field.content_disposition();
        
        if let Some(name) = content_disposition.get_name() {
            if name == "file" {
                // Create temporary file for OCR processing
                let mut temp_file = NamedTempFile::new()
                    .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to create temp file: {}", e)))?;
                
                // Write uploaded file data to temp file
                while let Some(chunk) = field.try_next().await? {
                    temp_file.write_all(&chunk)
                        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to write to temp file: {}", e)))?;
                }
                
                // Perform OCR on the image
                match perform_ocr(temp_file.path().to_str().unwrap()).await {
                    Ok(ocr_text) => {
                        // Parse Kaspi Pay receipt data
                        let kaspi_data = parse_kaspi_receipt(&ocr_text);
                        
                        return Ok(HttpResponse::Ok().json(OCRResponse {
                            success: true,
                            text: Some(ocr_text),
                            amount: Some(kaspi_data.amount),
                            error: None,
                        }));
                    }
                    Err(e) => {
                        return Ok(HttpResponse::InternalServerError().json(OCRResponse {
                            success: false,
                            text: None,
                            amount: None,
                            error: Some(format!("OCR failed: {}", e)),
                        }));
                    }
                }
            }
        }
    }
    
    Ok(HttpResponse::BadRequest().json(OCRResponse {
        success: false,
        text: None,
        amount: None,
        error: Some("No file uploaded".to_string()),
    }))
}

async fn perform_ocr(_image_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    // Temporary mock implementation for OCR
    // TODO: Implement actual OCR when paddle-ocr-rs is properly configured
    Ok("Kaspi Pay\nСумма: 1000.00 ₸\nПолучатель: Test Merchant\nДата: 2025-07-17\nID: 123456789".to_string())
}

fn parse_kaspi_receipt(text: &str) -> KaspiReceiptData {
    let mut amount = 0.0;
    let mut merchant = None;
    let mut date = None;
    let mut transaction_id = None;
    
    // Parse amount from Kaspi Pay receipt text
    // Look for patterns like "Сумма: 1000 ₸" or "1000.00 KZT"
    for line in text.lines() {
        let line = line.trim();
        
        // Extract amount
        if line.contains("Сумма") || line.contains("сумма") || line.contains("СУММА") {
            if let Some(amount_str) = extract_amount_from_line(line) {
                if let Ok(parsed_amount) = amount_str.parse::<f64>() {
                    amount = parsed_amount;
                }
            }
        }
        
        // Extract merchant name
        if line.contains("Получатель") || line.contains("получатель") || line.contains("ПОЛУЧАТЕЛЬ") {
            merchant = Some(line.to_string());
        }
        
        // Extract date
        if line.contains("Дата") || line.contains("дата") || line.contains("ДАТА") {
            date = Some(line.to_string());
        }
        
        // Extract transaction ID
        if line.contains("ID") || line.contains("Номер") || line.contains("номер") {
            transaction_id = Some(line.to_string());
        }
    }
    
    KaspiReceiptData {
        amount,
        merchant,
        date,
        transaction_id,
    }
}

fn extract_amount_from_line(line: &str) -> Option<String> {
    // Extract numeric amount from line
    // Look for patterns like "1000.00", "1000", "1 000.00", etc.
    let re = regex::Regex::new(r"(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)")
        .ok()?;
    
    if let Some(captures) = re.captures(line) {
        if let Some(amount_match) = captures.get(1) {
            let amount_str = amount_match.as_str().replace(" ", "").replace(",", ".");
            return Some(amount_str);
        }
    }
    
    None
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.route("/upload", web::post().to(upload_receipt));
}
