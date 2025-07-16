use axum::{Json, Router, routing::post, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use libp2p::PeerId;

#[derive(Debug, Serialize, Deserialize)]
pub struct SignalMessage {
    pub peer_id: String,
    pub sdp: String,
}

#[derive(Clone)]
pub struct SignalingState {
    pending_offers: Arc<Mutex<Vec<(PeerId, String)>>>,
}

impl Default for SignalingState {
    fn default() -> Self {
        Self {
            pending_offers: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

impl SignalingState {
    /// Возвращает все pending offers для указанного peer
    pub fn get_offers_for_peer(&self, peer_id: &PeerId) -> Vec<String> {
        self.pending_offers
            .lock()
            .unwrap()
            .iter()
            .filter(|(p, _)| p == peer_id)
            .map(|(_, sdp)| sdp.clone())
            .collect()
    }
    
    /// Удаляет все offers для указанного peer
    pub fn clear_offers_for_peer(&self, peer_id: &PeerId) {
        self.pending_offers.lock().unwrap().retain(|(p, _)| p != peer_id);
    }
}

pub fn create_signaling_routes() -> Router<SignalingState> {
    Router::new()
        .route("/offer", post(handle_offer))
        .route("/answer", post(handle_answer))
        .with_state(SignalingState::default())
}

async fn handle_offer(
    state: State<SignalingState>,
    Json(msg): Json<SignalMessage>,
) -> Json<SignalMessage> {
    let peer_id = msg.peer_id.parse().unwrap();
    let sdp = msg.sdp.clone();
    state.pending_offers.lock().unwrap().push((peer_id, sdp));
    Json(msg)
}

async fn handle_answer(
    _state: State<SignalingState>,
    Json(msg): Json<SignalMessage>,
) -> Json<SignalMessage> {
    Json(msg)
}
