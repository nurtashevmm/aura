use aura_core::models::auth::{account_provider::AccountProvider, role::Role};
use aura_core::services::account_provider::DbAccountProvider;
use sqlx::sqlite::SqlitePool;

#[tokio::test]
async fn test_account_provider() {
    let pool = SqlitePool::connect("sqlite::memory:")
        .await
        .unwrap();
        
    sqlx::query(
        "CREATE TABLE accounts (user_id TEXT PRIMARY KEY, role TEXT NOT NULL)"
    )
    .execute(&pool)
    .await
    .unwrap();
    
    sqlx::query(
        "INSERT INTO accounts (user_id, role) VALUES (?, ?)"
    )
    .bind("test_user")
    .bind("user")
    .execute(&pool)
    .await
    .unwrap();
    
    let provider = DbAccountProvider::new(pool);
    let role = AccountProvider::get_role(&provider, "test_user").await.unwrap();
    assert_eq!(role, Role::User);
}
