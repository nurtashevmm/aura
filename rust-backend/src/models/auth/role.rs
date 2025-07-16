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
