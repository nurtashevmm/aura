use actix_web::{test, web, App};
use aura::billing::{BillingService, KaspiPaymentRequest};
use aura::api::SqliteAppState;
use sqlx::SqlitePool;

#[sqlx::test]
async fn test_kaspi_payment() {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    
    let app = test::init_service(
        App::new()
            .app_data(web::Data::new(SqliteAppState::new(pool)))
            .configure(BillingService::config)
    ).await;
    
    // Test successful payment
    let req = test::TestRequest::post()
        .uri("/billing/kaspi")
        .set_json(KaspiPaymentRequest {
            amount: 1000.0,
            phone: "+77771234567".to_string(),
        })
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // Test invalid amount
    let req = test::TestRequest::post()
        .uri("/billing/kaspi")
        .set_json(KaspiPaymentRequest {
            amount: -100.0,
            phone: "+77771234567".to_string(),
        })
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_client_error());
}

#[sqlx::test]
async fn test_payout_csv() {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    sqlx::query("CREATE TABLE pending_payouts (merchant_id TEXT, amount REAL)")
        .execute(&pool)
        .await
        .unwrap();
    
    sqlx::query("INSERT INTO pending_payouts VALUES ('merchant1', 100.0)")
        .execute(&pool)
        .await
        .unwrap();
    
    let billing = BillingService::new();
    let csv = billing.generate_payout_csv(&pool).await.unwrap();
    assert!(csv.contains("merchant1"));
    assert!(csv.contains("100"));
}
