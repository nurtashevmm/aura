use actix_web::{test, App};
use aura_core::api;
use sqlx::postgres::PgPoolOptions;
use std::env;

#[actix_rt::test]
async fn test_session_flow_and_stats() {
    let database_url = env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost/aura_test".into());

    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await
        .expect("connect test db");
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();

    sqlx::query("TRUNCATE sessions RESTART IDENTITY").execute(&pool).await.unwrap();

    let app_state = api::AppState::new(
        #[cfg(feature = "p2p")]
        None,
        pool.clone(),
    );

    let mut app = test::init_service(
        App::new()
            .app_data(actix_web::web::Data::new(app_state))
            .configure(api::configure),
    )
    .await;

    // start session
    let req = test::TestRequest::post()
        .uri("/api/session/start")
        .set_json(&serde_json::json!({ "pc_id": "TEST-PC" }))
        .to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(resp.status().is_success());

    // call stats summary -> should report 1 active
    let req = test::TestRequest::get().uri("/api/stats/summary").to_request();
    let resp: serde_json::Value = test::call_and_read_body_json(&mut app, req).await;
    assert_eq!(resp["active_sessions"].as_i64().unwrap(), 1);

    // stop session
    let req = test::TestRequest::post()
        .uri("/api/session/stop")
        .set_json(&serde_json::json!({ "pc_id": "TEST-PC" }))
        .to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(resp.status().is_success());

    let req = test::TestRequest::get().uri("/api/stats/summary").to_request();
    let resp: serde_json::Value = test::call_and_read_body_json(&mut app, req).await;
    assert_eq!(resp["active_sessions"].as_i64().unwrap(), 0);
}
