use aura_core::models::auth::account_provider::AccountProvider;
use aura_core::services::account_provider::DbAccountProvider;
use sqlx::PgPool;

#[tokio::test]
async fn test_account_provider() {
    // Setup test database
    let pool = PgPool::connect("postgres://testuser:testpass@localhost/test").await.unwrap();
    
    // Initialize service
    let account_provider = DbAccountProvider::new(pool);
    
    // Test get_role with seeded test user
    let result = account_provider.get_role("test_user").await;
    assert!(result.is_ok());
    assert_eq!(format!("{:?}", result.unwrap()), "Role::User");
}
