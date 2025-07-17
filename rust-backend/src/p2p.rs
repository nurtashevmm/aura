//! # P2P Service Module
//! 
//! Provides peer-to-peer networking functionality for AURA Play platform.
//! 
//! ## Features
//! - Tailscale integration for NAT traversal
//! - Sunshine/Moonlight streaming support
//! - Real-time stream monitoring
//! - Peer discovery and management

/// P2P service configuration
#[derive(Clone, Debug)]
pub struct P2pConfig {
    /// Enable Tailscale integration
    pub use_tailscale: bool,
    /// Default stream configuration
    pub default_stream_config: StreamConfig
}

use actix_web::{web, HttpResponse, Responder};
use aura_p2p::{P2pError, StreamStatus};
use tailscale_client::Tailscale;
use sunshine_client::{SunshineClient, StreamConfig};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use crate::api::{AppState, PeerInfo};
use tokio::sync::watch;

#[derive(Clone)]
pub struct P2pService {
    tailscale: Arc<Tailscale>,
    peers: Arc<Mutex<HashMap<String, PeerInfo>>>,
    stream_status: Arc<watch::Sender<StreamStatus>>
}

impl P2pService {
    pub fn new() -> Result<Self, P2pError> {
        let tailscale = Tailscale::new()?;
        let (tx, _) = watch::channel(StreamStatus::default());
        Ok(Self {
            tailscale: Arc::new(tailscale),
            peers: Arc::new(Mutex::new(HashMap::new())),
            stream_status: Arc::new(tx)
        })
    }

    pub fn get_peer_address(&self, peer_id: &str) -> Option<String> {
        self.tailscale.get_peer_address(peer_id)
    }

    pub fn start_stream(&self, peer_id: &str, config: StreamConfig) -> Result<(), P2pError> {
        let address = self.get_peer_address(peer_id)
            .ok_or(P2pError::PeerNotFound)?;
            
        let client = SunshineClient::new(address)?;
        client.start_stream(config)?;
        
        self.update_stream_status(StreamStatus::Started);
        
        Ok(())
    }
    
    pub fn stop_stream(&self, peer_id: &str) -> Result<(), P2pError> {
        // Реализация остановки стрима
        self.update_stream_status(StreamStatus::Stopped);
        Ok(())
    }

    pub fn get_stream_status(&self) -> watch::Receiver<StreamStatus> {
        self.stream_status.subscribe()
    }

    pub fn update_stream_status(&self, status: StreamStatus) {
        self.stream_status.send(status).unwrap();
    }
}

pub async fn get_peers(state: web::Data<AppState>) -> impl Responder {
    let peers = state.p2p.as_ref().unwrap().get_connected_peers();
    HttpResponse::Ok().json(
        peers.iter().map(|p| PeerInfo {
            id: p.to_string(),
            address: state.p2p.as_ref().unwrap().get_peer_address(&p.to_string()).unwrap_or("".to_string())
        }).collect::<Vec<_>>()
    )
}

pub async fn get_peers_count(state: web::Data<AppState>) -> impl Responder {
    let count = state.p2p.as_ref().unwrap().get_connected_peers().len();
    HttpResponse::Ok().json(count)
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;

    #[test]
    fn test_start_stream() {
        let mut mock_tailscale = MockTailscale::new();
        mock_tailscale.expect_get_peer_address()
            .with(eq("peer1"))
            .returning(|_| Some("127.0.0.1:8080".to_string()));
            
        let p2p = P2pService {
            tailscale: Arc::new(mock_tailscale),
            peers: Arc::new(Mutex::new(HashMap::new())),
            stream_status: Arc::new(watch::channel(StreamStatus::default()).0)
        };
        
        let config = StreamConfig::default();
        assert!(p2p.start_stream("peer1", config).is_ok());
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;

    #[tokio::test]
    async fn test_stream_monitoring() {
        let p2p = P2pService::new().unwrap();
        let mut rx = p2p.get_stream_status();
        
        p2p.update_stream_status(StreamStatus::Started);
        assert_eq!(*rx.borrow(), StreamStatus::Started);
        
        p2p.update_stream_status(StreamStatus::Stopped);
        assert_eq!(*rx.borrow(), StreamStatus::Stopped);
    }

    #[tokio::test]
    async fn test_peer_discovery() {
        let p2p = P2pService::new().unwrap();
        
        // Тест должен запускать реальный Tailscale в тестовом режиме
        let peers = p2p.tailscale.discover_peers().await.unwrap();
        assert!(peers.len() > 0);
    }
}
