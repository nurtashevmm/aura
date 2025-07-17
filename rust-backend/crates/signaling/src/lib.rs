pub mod message;
pub use message::{SignalMessage, SignalingError};

pub fn create_signaling_routes() -> axum::Router {
    axum::Router::new()
}