use libp2p::{identity, PeerId, ping::{Ping, PingConfig}, swarm::{Swarm, SwarmEvent}, tcp::TokioTcpConfig, noise, yamux, futures::StreamExt, core::upgrade, transport::{Boxed, StreamMuxerBox}};
use libp2p_webrtc_websys;
use thiserror::Error;
use std::sync::{Arc, Mutex};

#[derive(Error, Debug)]
pub enum P2pError {
    #[error("Key generation failed")]
    KeyGeneration,
    #[error("Network error")]
    Network(#[from] libp2p::swarm::SwarmError),
}

struct MyBehaviour;

impl libp2p::swarm::NetworkBehaviour for MyBehaviour {
    type Protocols = libp2p::ping::Ping;
    type OutEvent = libp2p::ping::PingEvent;

    fn new_handler(&mut self, _peer_id: PeerId) -> Self::Protocols {
        libp2p::ping::Ping::new(PingConfig::new().with_keep_alive(true))
    }

    fn handle_event(&mut self, _peer_id: PeerId, event: <Self::Protocols as libp2p::swarm::NetworkBehaviour>::OutEvent) {
        match event {
            libp2p::ping::PingEvent::Ping { .. } => {
                log::debug!("Received ping event");
            }
        }
    }
}

#[derive(Clone, Default)]
pub struct NetworkStats {
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub ping_latency: f64,
}

#[derive(Clone)]
pub struct P2pService {
    swarm: Arc<Mutex<Swarm<MyBehaviour>>>,
    connected_peers: Arc<Mutex<Vec<PeerId>>>,
    stats: Arc<Mutex<NetworkStats>>,
}

impl P2pService {
    pub fn new() -> Result<Self, P2pError> {
        // Generate keypair for this peer
        let keypair = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(keypair.public());
        
        // Set up transport
        let transport = create_transport(&peer_id);
            
        // Create swarm
        let swarm = Swarm::with_tokio_executor(
            transport,
            MyBehaviour,
            peer_id,
        );
        
        Ok(Self { 
            swarm: Arc::new(Mutex::new(swarm)), 
            connected_peers: Arc::new(Mutex::new(Vec::new())),
            stats: Arc::new(Mutex::new(NetworkStats::default())),
        })
    }
    
    pub async fn run(mut self) -> Result<(), P2pError> {
        // Listen on all interfaces
        self.swarm.lock().unwrap().listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;
        
        // Main event loop
        while let Some(event) = self.swarm.lock().unwrap().next().await {
            match event {
                SwarmEvent::NewListenAddr { address, .. } => {
                    log::info!("Listening on {:?}", address);
                }
                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                    self.connected_peers.lock().unwrap().push(peer_id);
                }
                SwarmEvent::ConnectionClosed { peer_id, .. } => {
                    self.connected_peers.lock().unwrap().retain(|p| p != &peer_id);
                }
                SwarmEvent::Behaviour(event) => {
                    log::debug!("Ping event: {:?}", event);
                }
                _ => {}
            }
        }
        
        Ok(())
    }

    pub fn get_connected_peers(&self) -> Vec<PeerId> {
        self.connected_peers.lock().unwrap().clone()
    }

    pub fn get_network_stats(&self) -> NetworkStats {
        self.stats.lock().unwrap().clone()
    }

    pub async fn send(&self, peer_id: &PeerId, message: &[u8]) -> Result<(), P2pError> {
        // In a real implementation, this would use a proper messaging protocol
        log::info!("Sending message to {:?}: {:?}", peer_id, message);
        Ok(())
    }
}

#[cfg(target_arch = "wasm32")]
fn create_transport(peer_id: &PeerId) -> Boxed<(PeerId, StreamMuxerBox)> {
    let transport = libp2p_webrtc_websys::Transport::new(peer_id.clone());
    transport.boxed()
}

#[cfg(not(target_arch = "wasm32"))]
fn create_transport(peer_id: &PeerId) -> Boxed<(PeerId, StreamMuxerBox)> {
    // Existing TCP transport
    TokioTcpConfig::new()
        .upgrade(upgrade::Version::V1)
        .authenticate(noise::Config::new(peer_id).unwrap())
        .multiplex(yamux::YamuxConfig::default())
        .boxed()
}

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
