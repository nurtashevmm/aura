use actix_web::{post, web, HttpResponse, Responder};
use leptess::LepTess;
use serde_json::json;
use sqlx::PgPool;
use std::io::Write;
use tempfile::NamedTempFile;
use uuid::Uuid;
use tokio::time::Duration;

#[post("/payment/verify-cheque")]
pub async fn verify_cheque(
    mut payload: actix_multipart::Multipart,
    pool: web::Data<PgPool>,
    auth: BearerAuth,
) -> impl Responder {
    // 1. Process uploaded file
    let mut file = NamedTempFile::new().unwrap();
    while let Some(item) = payload.next().await {
        let mut field = item.unwrap();
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            file.write_all(&data).unwrap();
        }
    }

    // 2. Perform OCR with retries
    let text = {
        let mut attempts = 0;
        let max_attempts = 3;
        let mut last_error = None;
        
        loop {
            match LepTess::new(None, "kaz+eng+rus") {
                Ok(mut lt) => {
                    if let Err(e) = lt.set_image(file.path().to_str().unwrap()) {
                        last_error = Some(e);
                    } else {
                        if let Ok(text) = lt.get_utf8_text() {
                            break text;
                        }
                    }
                }
                Err(e) => last_error = Some(e),
            }
            
            attempts += 1;
            if attempts >= max_attempts {
                let _ = sqlx::query!(
                    "INSERT INTO notifications (user_id, type, message) 
                    VALUES ($1, 'payment_failed', $2)",
                    auth.user_id,
                    format!("OCR failed after {} attempts", max_attempts)
                )
                .execute(&**pool)
                .await;
                
                let user_email = sqlx::query_scalar!(
                    "SELECT email FROM users WHERE id = $1",
                    auth.user_id
                )
                .fetch_one(&**pool)
                .await?;
                
                send_email(
                    &user_email,
                    "Payment Failed",
                    &format!("Your payment failed after {} attempts", max_attempts)
                ).await?;
                
                return HttpResponse::BadRequest().json(json!({ 
                    "error": format!("OCR failed after {} attempts: {:?}", max_attempts, last_error) 
                }));
            }
            
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    };

    // 3. Parse cheque data
    let amount = text
        .lines()
        .find(|l| l.contains("Сумма") || l.contains("Summa"))
        .and_then(|l| l.split(':').last())
        .and_then(|s| s.trim().parse::<i32>().ok());

    // 4. Create pending topup record
    let topup_id = Uuid::new_v4();
    sqlx::query!(
        "INSERT INTO pending_topups 
        (id, user_id, expected_amount, status) 
        VALUES ($1, $2, $3, 'pending')",
        topup_id,
        auth.user_id,
        amount.unwrap_or(0)
    )
    .execute(&**pool)
    .await
    .unwrap();

    // 5. Return parsed data
    HttpResponse::Ok().json(json!({
        "text": text,
        "amount": amount,
        "status": "pending_verification",
        "topup_id": topup_id
    }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(verify_cheque);
}
