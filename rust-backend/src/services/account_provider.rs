use crate::models::auth::{account_provider::AccountProvider, auth_error::AuthError, role::Role};
use async_trait::async_trait;
use sqlx::sqlite::SqlitePool;

#[derive(Clone)]
pub struct DbAccountProvider {
    pool: SqlitePool,
}

impl DbAccountProvider {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AccountProvider for DbAccountProvider {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError> {
        let role_str: String = sqlx::query_scalar(
            r#"SELECT role FROM accounts WHERE user_id = ?"#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|_| AuthError::InvalidRole)?;

        match role_str.to_lowercase().as_str() {
            "admin" => Ok(Role::Admin),
            "user" => Ok(Role::User),
            _ => Err(AuthError::InvalidRole),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;
    
    #[tokio::test]
    async fn test_get_role() {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite::memory:")
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
        .bind("test_admin")
        .bind("admin")
        .execute(&pool)
        .await
        .unwrap();
        
        let provider = DbAccountProvider::new(pool);
        let role = provider.get_role("test_admin").await.unwrap();
        assert_eq!(role.to_string(), "admin");
        assert_eq!(role, Role::Admin);
    }
}
