use actix_web::{test, App};
use aura_core::api;
use aura_core::models::auth::account_provider::AccountProvider;
use aura_core::models::auth::role::Role;
use aura_core::services::account_provider::DbAccountProvider;
use sqlx::sqlite::SqlitePool;

#[tokio::test]
async fn test_balance_topup() {
    // Setup test database
    let pool = SqlitePool::connect("sqlite::memory:")
        .await
        .unwrap();
        
    // Create necessary tables
    sqlx::query(
        "CREATE TABLE accounts (user_id TEXT PRIMARY KEY, role TEXT NOT NULL)"
    )
    .execute(&pool)
    .await
    .unwrap();
    
    sqlx::query(
        "CREATE TABLE balances (user_id TEXT PRIMARY KEY, amount INTEGER NOT NULL)"
    )
    .execute(&pool)
    .await
    .unwrap();
    
    sqlx::query(
        "CREATE TABLE transactions (id INTEGER PRIMARY KEY, user_id TEXT, amount INTEGER, description TEXT)"
    )
    .execute(&pool)
    .await
    .unwrap();
    
    // Insert test data
    sqlx::query(
        "INSERT INTO accounts (user_id, role) VALUES (?, ?)"
    )
    .bind("test_user")
    .bind("user")
    .execute(&pool)
    .await
    .unwrap();
    
    sqlx::query(
        "INSERT INTO balances (user_id, amount) VALUES (?, ?)"
    )
    .bind("test_user")
    .bind(100)
    .execute(&pool)
    .await
    .unwrap();
    
    // Initialize services
    let account_provider = DbAccountProvider::new(pool.clone());
    
    // Test account provider
    let role = account_provider.get_role("test_user").await.unwrap();
    assert_eq!(role, Role::User);
    
    // Setup test app
    let app_state = api::AppState::new(
        #[cfg(feature = "p2p")]
        None,
        pool.clone(),
    );
    
    let app = test::init_service(
        App::new()
            .app_data(actix_web::web::Data::new(app_state))
            .configure(api::configure::<sqlx::Sqlite>),
    )
    .await;
    
    // Test API endpoint
    let req = test::TestRequest::post()
        .uri("/api/balance/topup")
        .set_json(&serde_json::json!({ "user_id": "test_user", "amount": 1000 }))
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    // Verify balance updated
    let row: (i64,) = sqlx::query_as("SELECT amount FROM balances WHERE user_id = 'test_user'")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(row.0, 1100);
}
