use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct PendingTopup {
    pub id: Uuid,
    pub user_id: Uuid,
    pub expected_amount: i32,
    pub created_at: DateTime<Utc>,
    pub status: String,
    pub matched_cheque_data: Option<serde_json::Value>,
    pub file_url: Option<String>,
}
