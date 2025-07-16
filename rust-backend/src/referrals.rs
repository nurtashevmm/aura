use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Referral {
    pub code: String,
    pub referrer_id: String,
    pub referred_id: Option<String>,
    pub created_at: i64,
    pub completed: bool,
    pub reward_amount: f64,
}

pub struct ReferralService;

impl ReferralService {
    pub fn generate_code(&self, user_id: &str) -> Referral {
        Referral {
            code: Uuid::new_v4().to_string(),
            referrer_id: user_id.to_string(),
            referred_id: None,
            created_at: chrono::Utc::now().timestamp(),
            completed: false,
            reward_amount: 10.0, // $10 reward for both parties
        }
    }

    pub fn apply_referral(&mut self, code: &str, referred_id: &str) -> Option<Referral> {
        // In a real implementation, this would update the referral status
        Some(Referral {
            code: code.to_string(),
            referrer_id: "referrer123".to_string(),
            referred_id: Some(referred_id.to_string()),
            created_at: chrono::Utc::now().timestamp(),
            completed: true,
            reward_amount: 10.0,
        })
    }
}
