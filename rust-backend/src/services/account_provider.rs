use crate::models::auth::{account_provider::AccountProvider, auth_error::AuthError, role::Role};
use async_trait::async_trait;
use sqlx::{PgPool, postgres::PgPoolOptions};

pub struct DbAccountProvider {
    pool: PgPool,
}

impl DbAccountProvider {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AccountProvider for DbAccountProvider {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError> {
        let pool = self.pool.clone();
        let role_str: String = sqlx::query_scalar(
            r#"SELECT role FROM accounts WHERE user_id = $1"#,
        )
        .bind(user_id)
        .fetch_one(&pool)
        .await
        .map_err(|_| AuthError::InvalidRole)?;

        role_str.parse().map_err(|_| AuthError::InvalidRole)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use tokio::runtime::Runtime;

    #[test]
    fn test_get_role() {
        let rt = Runtime::new().unwrap();
        rt.block_on(async {
            let pool = PgPoolOptions::new()
                .connect("postgres://localhost/test")
                .await
                .unwrap();
            
            let provider = DbAccountProvider::new(pool);
            let _ = provider.get_role("test_admin").await;
        });
    }
}
