use signaling::SignalMessage;

#[tokio::test]
async fn test_signaling_message_validation() {
    // Test valid message
    let valid_msg = SignalMessage::new(
        "peer1".to_string(),
        "peer2".to_string(), 
        "offer".to_string()
    ).unwrap();
    
    assert_eq!(valid_msg.from, "peer1");
    assert_eq!(valid_msg.to, "peer2");
    
    // Test invalid peer IDs
    assert!(SignalMessage::new(
        "".to_string(), 
        "peer2".to_string(),
        "offer".to_string()
    ).is_err());
    
    // Test message types
    assert!(SignalMessage::new(
        "peer1".to_string(),
        "peer2".to_string(),
        "invalid_type".to_string()
    ).is_err());
}

#[tokio::test]
async fn test_message_serialization() {
    let msg = SignalMessage::new(
        "peer1".to_string(),
        "peer2".to_string(),
        "answer".to_string()
    ).unwrap();
    
    let serialized = serde_json::to_string(&msg).unwrap();
    let deserialized: SignalMessage = serde_json::from_str(&serialized).unwrap();
    
    assert_eq!(msg.from, deserialized.from);
    assert_eq!(msg.payload, deserialized.payload);
}
