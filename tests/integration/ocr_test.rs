#[tokio::test]
async fn test_real_receipt_ocr() {
    let receipt = include_bytes!("kaspi_receipt.jpg");
    let result = process_ocr(receipt).await;
    assert!(result.is_ok());
    
    let text = result.unwrap();
    assert!(text.contains("Kaspi"));
    assert!(text.contains("KZT"));
}
