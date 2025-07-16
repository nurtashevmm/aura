use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ClientConfig {
    pub resolution: String,
    pub bitrate: u32,
    pub fps: u32,
    pub server_address: String,
    pub auth_token: String,
}

pub fn auto_detect_config(network_speed: f64) -> ClientConfig {
    // Auto-detect optimal settings based on network speed
    let (resolution, bitrate, fps) = if network_speed > 50.0 {
        ("1920x1080", 20000, 60)
    } else if network_speed > 20.0 {
        ("1280x720", 10000, 60)
    } else {
        ("854x480", 5000, 30)
    };

    ClientConfig {
        resolution: resolution.to_string(),
        bitrate,
        fps,
        server_address: String::new(),
        auth_token: String::new(),
    }
}
