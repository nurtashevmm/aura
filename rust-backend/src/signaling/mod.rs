use serde::{Serialize, Deserialize};
use thiserror::Error;
use webrtc::ice_transport::ice_candidate::RTCIceCandidate;

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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub candidates: Option<Vec<RTCIceCandidate>>
}

impl SignalMessage {
    pub fn new(from: String, to: String, payload: String) -> Result<Self, SignalingError> {
        if from.is_empty() || to.is_empty() {
            return Err(SignalingError::InvalidPeerId);
        }
        
        if !["offer", "answer", "candidate"].contains(&payload.as_str()) {
            return Err(SignalingError::InvalidMessageType);
        }
        
        Ok(Self { from, to, payload, candidates: None })
    }

    pub fn add_candidate(&mut self, candidate: RTCIceCandidate) {
        if let Some(ref mut candidates) = self.candidates {
            candidates.push(candidate);
        } else {
            self.candidates = Some(vec![candidate]);
        }
    }
}
