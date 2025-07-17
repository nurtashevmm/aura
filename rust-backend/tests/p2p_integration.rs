use aura_core::api::AppState;
use axum::Router;
use tower::ServiceExt;
use axum::http::StatusCode;
use axum::body::Body;
use axum::http::Request;

#[tokio::test]
async fn test_p2p_integration() {
    let db_pool = sqlx::PgPool::connect("postgres://...").await.unwrap();
    let state = AppState::new(db_pool);
    let app = Router::new().with_state(state);
    
    let response = app
        .oneshot(Request::builder().uri("/api/p2p/peers").body(Body::empty()).unwrap())
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
}
