use async_trait::async_trait;
use crate::models::auth::{account_provider::AccountProvider, auth_error::AuthError, role::Role};

#[async_trait]
pub trait AuthService: Send + Sync {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError>;
}

#[async_trait]
impl<T: AccountProvider + Send + Sync> AuthService for T {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError> {
        AccountProvider::get_role(self, user_id)
    }
}
