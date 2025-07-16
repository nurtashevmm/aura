pub mod signaling;

use libp2p::{
    identity,
    ping::{self, Behaviour as Ping},
    identify::{self, Behaviour as Identify, Config as IdentifyConfig},
    swarm::{Swarm, Config},
    tcp::tokio::Transport,
    noise,
    yamux,
    floodsub::{self, Behaviour as Floodsub, Topic},
    PeerId,
    Transport as Libp2pTransport
};
use libp2p_swarm_derive::NetworkBehaviour;
use thiserror::Error;
use tailscale_client::TailscaleClient;
use std::sync::{Arc, Mutex};

#[derive(NetworkBehaviour)]
pub struct P2PBehaviour {
    ping: Ping,
    identify: Identify,
    floodsub: Floodsub,
}

#[derive(Error, Debug)]
pub enum P2pError {
    #[error("Connection failed")]
    ConnectionFailed,
}

#[derive(Clone)]
pub struct P2PService {
    inner: Arc<Mutex<P2PServiceInner>>,
}

struct P2PServiceInner {
    tailscale: TailscaleClient,
    _swarm: Swarm<P2PBehaviour>,
}

impl P2PService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let tailscale = TailscaleClient::new("your-api-key".to_string());
        
        let local_key = identity::Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());
        
        let mut behaviour = P2PBehaviour {
            ping: Ping::default(),
            identify: Identify::new(IdentifyConfig::new(
                "/aura/1.0.0".to_string(),
                local_key.public()
            )),
            floodsub: Floodsub::new(local_peer_id),
        };

        let transport = Transport::default()
            .upgrade(libp2p::core::upgrade::Version::V1)
            .authenticate(noise::Config::new(&local_key)?)
            .multiplex(yamux::Config::default())
            .boxed();
            
        let swarm = Swarm::new(
            transport,
            behaviour,
            local_peer_id,
            Config::without_executor()
        );

        Ok(Self {
            inner: Arc::new(Mutex::new(P2PServiceInner { tailscale, _swarm: swarm }))
        })
    }

    pub fn get_connected_peers(&self) -> Vec<PeerId> {
        let inner = self.inner.lock().unwrap();
        inner._swarm.connected_peers().cloned().collect()
    }
    
    pub fn send(&self, topic_name: String, message: Vec<u8>) -> Result<(), Box<dyn std::error::Error>> {
        let mut inner = self.inner.lock().unwrap();
        let behaviour = inner._swarm.behaviour_mut();
        let topic = Topic::new(topic_name);
        behaviour.floodsub.publish(topic, message);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_service_creation() -> Result<(), Box<dyn std::error::Error>> {
        let _service = P2PService::new()?;
        Ok(())
    }
}
