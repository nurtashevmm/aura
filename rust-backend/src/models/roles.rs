#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UserRole {
    SuperAdmin,
    Admin,
    Merchant,
    Player,
    Guest,
}

impl UserRole {
    pub fn from_str(role: &str) -> Option<Self> {
        match role.to_lowercase().as_str() {
            "superadmin" => Some(Self::SuperAdmin),
            "admin" => Some(Self::Admin),
            "merchant" => Some(Self::Merchant),
            "player" => Some(Self::Player),
            "guest" => Some(Self::Guest),
            _ => None,
        }
    }
    
    pub fn has_permission(&self, required: Permission) -> bool {
        match self {
            Self::SuperAdmin => true,
            Self::Admin => required != Permission::ManageSystem,
            Self::Merchant => matches!(
                required,
                Permission::ManageGames | Permission::ViewAnalytics
            ),
            Self::Player => required == Permission::PlayGames,
            Self::Guest => false,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Permission {
    ManageSystem,
    ManageUsers,
    ManageGames,
    ViewAnalytics,
    PlayGames,
}
