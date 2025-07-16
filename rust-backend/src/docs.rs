use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum UserRole {
    Merchant,
    Player,
    Streamer,
    EnterpriseAdmin,
    SystemAdmin,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Documentation {
    pub role: UserRole,
    pub title: String,
    pub content: String,
    pub last_updated: i64,
}

pub struct DocsService;

impl DocsService {
    pub fn get_docs(&self, role: UserRole) -> Vec<Documentation> {
        // In a real implementation, this would fetch from a database
        vec![Documentation {
            role,
            title: "Getting Started".to_string(),
            content: "Welcome to Aura Cloud Gaming Platform!".to_string(),
            last_updated: chrono::Utc::now().timestamp(),
        }]
    }
}
