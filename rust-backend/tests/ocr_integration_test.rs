use aura_backend::ocr::process_receipt;

#[test]
fn test_real_kaspi_receipt_ocr() {
    // Assume the image provided by the user is saved here
    let image_path = "./tests/fixtures/kaspi_receipt_real.png";

    // Check if the file exists before running the test
    if !std::path::Path::new(image_path).exists() {
        // Skip the test if the image is not available
        // In a real CI/CD pipeline, we would fail the build or have the image committed
        println!("Test skipped: Image file not found at {}. Please add the test receipt.", image_path);
        return;
    }

    let ocr_result = process_receipt(image_path);

    assert!(ocr_result.is_ok(), "OCR processing failed");
    let extracted_data = ocr_result.unwrap();

    // Assert that the key information is extracted correctly
    // Note: These values are based on the provided image. OCR might have slight variations.
    assert_eq!(extracted_data.total_amount, Some(24300.0));
    assert_eq!(extracted_data.receipt_number, Some("QR9016788128".to_string()));
    // We can add more assertions for date, time, etc. as the OCR logic matures.
    println!("Successfully processed real Kaspi receipt.");
}
