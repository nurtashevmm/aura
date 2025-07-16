use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Streamer {
    pub id: String,
    pub platform: StreamingPlatform,
    pub username: String,
    pub followers: u32,
    pub commission_rate: f32,
    pub total_earned: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum StreamingPlatform {
    Twitch,
    YouTube,
    Kick,
    Tiktok,
}

pub struct StreamerService;

impl StreamerService {
    pub fn register_streamer(
        &self,
        platform: StreamingPlatform,
        username: String,
        followers: u32
    ) -> Streamer {
        Streamer {
            id: uuid::Uuid::new_v4().to_string(),
            platform,
            username,
            followers,
            commission_rate: 0.1, // 10% commission
            total_earned: 0.0,
        }
    }
}
