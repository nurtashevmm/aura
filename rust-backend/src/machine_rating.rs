use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Rating {
    pub session_id: String,
    pub machine_id: String,
    pub ping: u32,
    pub fps: u32,
    pub stability: u8,
    pub overall: u8,
    pub comments: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MachineStats {
    pub avg_ping: f64,
    pub avg_fps: f64,
    pub avg_stability: f64,
    pub avg_overall: f64,
    pub total_sessions: u32,
}

pub fn calculate_machine_stats(ratings: Vec<Rating>) -> MachineStats {
    let count = ratings.len() as f64;
    
    MachineStats {
        avg_ping: ratings.iter().map(|r| r.ping as f64).sum::<f64>() / count,
        avg_fps: ratings.iter().map(|r| r.fps as f64).sum::<f64>() / count,
        avg_stability: ratings.iter().map(|r| r.stability as f64).sum::<f64>() / count,
        avg_overall: ratings.iter().map(|r| r.overall as f64).sum::<f64>() / count,
        total_sessions: ratings.len() as u32,
    }
}
