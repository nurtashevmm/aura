use super::*;
use actix_web::{http::StatusCode, test, web, App};
use aura_p2p::P2pService;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

#[derive(serde::Serialize)]
struct SendMessageRequest {
    peer_id: String,
    message: String,
}

#[actix_web::test]
async fn test_list_peers() {
    let p2p = Arc::new(P2pService::new());
    let state = web::Data::new(AppState::new(p2p.clone(), get_test_db_pool().await));
    
    let app = test::init_service(
        App::new()
            .app_data(state.clone())
            .configure(create_api)
    ).await;
    
    let req = test::TestRequest::get()
        .uri("/api/p2p/peers")
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_peer_count() {
    let p2p = Arc::new(P2pService::new());
    let state = web::Data::new(AppState::new(p2p.clone(), get_test_db_pool().await));
    
    let app = test::init_service(
        App::new()
            .app_data(state.clone())
            .configure(create_api)
    ).await;
    
    let req = test::TestRequest::get()
        .uri("/api/p2p/peers/count")
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let count: usize = test::read_body_json(resp).await;
    assert_eq!(count, 0);
}

#[actix_web::test]
async fn test_send_message() {
    let p2p = Arc::new(P2pService::new());
    let state = web::Data::new(AppState::new(p2p.clone(), get_test_db_pool().await));
    
    let app = test::init_service(
        App::new()
            .app_data(state.clone())
            .configure(create_api)
    ).await;
    
    let req = test::TestRequest::post()
        .uri("/api/p2p/send")
        .set_json(&SendMessageRequest {
            peer_id: "12D3KooWQJoBPf15f6uhi6qfe4BSM7cct1er465rGLimJUnbfWyE".to_string(),
            message: "test".to_string(),
        })
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_invalid_peer_id() {
    let p2p = Arc::new(P2pService::new());
    let state = web::Data::new(AppState::new(p2p.clone(), get_test_db_pool().await));
    
    let app = test::init_service(
        App::new()
            .app_data(state.clone())
            .configure(create_api)
    ).await;
    
    let req = test::TestRequest::post()
        .uri("/api/p2p/send")
        .set_json(&SendMessageRequest {
            peer_id: "invalid".to_string(),
            message: "test".to_string(),
        })
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

async fn get_test_db_pool() -> PgPool {
    PgPoolOptions::new()
        .max_connections(1)
        .connect("postgres://user:pass@localhost/aura")
        .await
        .unwrap()
}
