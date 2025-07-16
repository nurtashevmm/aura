use aura_p2p::signaling::{SignalingState, SignalMessage};
use libp2p::PeerId;

#[test]
fn test_signaling_state() {
    let state = SignalingState::default();
    let peer1 = PeerId::random();
    
    // Test signaling state functionality
    let _msg = SignalMessage {
        peer_id: peer1.to_string(),
        sdp: "test_sdp".to_string()
    };
    
    let offers = state.get_offers_for_peer(&peer1);
    assert!(offers.is_empty());
    
    state.clear_offers_for_peer(&peer1);
}
