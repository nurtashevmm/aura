use aura_core::api::AppState;
use aura_p2p::P2PService;
use axum::body::Body;
use axum::http::Request;
use axum::Router;
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test]
async fn test_p2p_peers_endpoint() {
    let p2p_service = P2PService::new().unwrap();
    let db_pool = PgPool::connect("postgres://...").await.unwrap();
    
    let state = AppState::new(p2p_service, db_pool);
    let app = Router::new().with_state(state);
    
    let response = app
        .oneshot(Request::builder().uri("/p2p/peers").body(Body::empty()).unwrap())
        .await
        .unwrap();
    
    assert_eq!(response.status(), 200);
}

#[sqlx::test]
async fn test_p2p_message_sending() {
    // Тест отправки сообщения через P2P
}
