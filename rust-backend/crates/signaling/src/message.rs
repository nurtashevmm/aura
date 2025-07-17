use serde::{Serialize, Deserialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SignalingError {
    #[error("Invalid peer ID")]
    InvalidPeerId,
    #[error("Invalid message type")]
    InvalidMessageType,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignalMessage {
    pub from: String,
    pub to: String,
    pub payload: String,
}

impl SignalMessage {
    pub fn new(from: String, to: String, payload: String) -> Result<Self, SignalingError> {
        if from.is_empty() || to.is_empty() {
            return Err(SignalingError::InvalidPeerId);
        }
        
        if !["offer", "answer", "candidate"].contains(&payload.as_str()) {
            return Err(SignalingError::InvalidMessageType);
        }
        
        Ok(Self { from, to, payload })
    }
}
