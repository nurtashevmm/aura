#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Role {
    Admin,
    Merchant,
    User,
}

impl std::str::FromStr for Role {
    type Err = ();
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Admin" => Ok(Role::Admin),
            "Merchant" => Ok(Role::Merchant),
            "User" => Ok(Role::User),
            _ => Err(())
        }
    }
}

use std::fmt;

impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Role::Admin => write!(f, "admin"),
            Role::Merchant => write!(f, "merchant"),
            Role::User => write!(f, "user"),
        }
    }
}
