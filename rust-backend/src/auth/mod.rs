use thiserror::Error;
use async_trait::async_trait;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Permission denied")]
    PermissionDenied,
    #[error("Invalid role")]
    InvalidRole,
}

#[derive(Debug, Clone, Copy)]
pub enum Role {
    Admin,
    Merchant,
    Player,
    Guest,
}

use std::str::FromStr;

impl FromStr for Role {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "admin" => Ok(Role::Admin),
            "merchant" => Ok(Role::Merchant),
            "player" => Ok(Role::Player),
            "guest" => Ok(Role::Guest),
            _ => Err(()),
        }
    }
}
impl Role {
    pub fn can_access(&self, resource: &str) -> bool {
        match self {
            Role::Admin => true,
            Role::Merchant => ["dashboard", "analytics"].contains(&resource),
            Role::Player => ["games", "library"].contains(&resource),
            Role::Guest => ["home", "login"].contains(&resource),
        }
    }
}

#[async_trait]
pub trait AccountProvider {
    async fn get_role(&self, user_id: &str) -> Result<Role, AuthError>;
}

pub struct AuthService<T: AccountProvider> {
    account_provider: T,
}

impl<T: AccountProvider> AuthService<T> {
    pub fn new(account_provider: T) -> Self {
        Self { account_provider }
    }

    pub async fn check_access(&self, user_id: &str, resource: &str) -> Result<(), AuthError> {
        let role = self.account_provider.get_role(user_id).await?;
        if role.can_access(resource) {
            Ok(())
        } else {
            Err(AuthError::PermissionDenied)
        }
    }
}