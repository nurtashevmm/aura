#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App};
    use std::fs;

    #[actix_rt::test]
    async fn test_verify_cheque() {
        // 1. Test successful OCR processing
        let mut app = test::init_service(
            App::new()
                .app_data(web::Data::new(get_test_pool()))
                .service(verify_cheque)
        ).await;

        // 2. Test with our sample receipt
        let file_content = fs::read("../../tests/kaspi_receipt.txt").unwrap();
        let req = test::TestRequest::post()
            .uri("/payment/verify-cheque")
            .set_payload(file_content)
            .to_request();

        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 200);

        // 3. Verify response contains expected amount
        let result: Value = test::read_body_json(resp).await;
        assert_eq!(result["amount"], 5000);
        assert_eq!(result["status"], "pending_verification");
    }

    #[actix_rt::test]
    async fn test_verify_cheque_invalid_file() {
        let mut app = test::init_service(
            App::new()
                .app_data(web::Data::new(get_test_pool()))
                .service(verify_cheque)
        ).await;

        // Test with invalid file content
        let req = test::TestRequest::post()
            .uri("/payment/verify-cheque")
            .set_payload("invalid content")
            .to_request();

        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 400);
    }

    #[actix_rt::test]
    async fn test_verify_cheque_empty_file() {
        let mut app = test::init_service(
            App::new()
                .app_data(web::Data::new(get_test_pool()))
                .service(verify_cheque)
        ).await;

        // Test with empty file
        let req = test::TestRequest::post()
            .uri("/payment/verify-cheque")
            .set_payload(vec![])
            .to_request();

        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 400);
    }
}
