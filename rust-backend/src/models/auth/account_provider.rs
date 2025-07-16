use crate::models::auth::role::Role;
use crate::models::auth::auth_error::AuthError;

#[async_trait::async_trait]
pub trait AccountProvider: Send + Sync {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError>;
}
