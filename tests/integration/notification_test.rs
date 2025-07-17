#[tokio::test]
async fn test_payment_failure_notification() {
    let test_db = setup_test_db().await;
    
    // Test notification creation
    let result = create_notification(
        test_db.user_id, 
        "payment_failed", 
        "OCR failed"
    ).await;
    
    assert!(result.is_ok());
    
    // Test email sending
    let emails = get_sent_emails().await;
    assert!(emails.iter().any(|e| e.subject.contains("Payment Failed")));
}
