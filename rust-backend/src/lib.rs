use actix_web::{web, App, HttpServer};
#[cfg(feature = "p2p")]
use aura_p2p::P2PService;
use sqlx::sqlite::SqlitePoolOptions;
#[cfg(feature = "p2p")]
use std::sync::Arc;

pub mod models;
pub mod middleware;
pub mod services;
pub mod api;
#[cfg(feature = "p2p")]
pub mod p2p;

pub async fn run() -> std::io::Result<()> {
    // Initialize P2P service
    #[cfg(feature = "p2p")]
    let p2p_service = Arc::new(P2PService::new().expect("Failed to initialize P2P service"));
    
    // Initialize database pool
    #[cfg(feature = "sqlite")]
    let db_pool = SqlitePoolOptions::new()
        .connect_lazy("sqlite::memory:")
        .unwrap();
    #[cfg(feature = "postgres")]
    let db_pool = PgPoolOptions::new()
        .connect_lazy("postgres://user:pass@localhost/db")
        .unwrap();
    
    #[cfg(feature = "sqlite")]
    let state = api::SqliteAppState::new(db_pool);
    #[cfg(feature = "postgres")]
    let state = api::PostgresAppState::new(db_pool);
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .configure(api::configure)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

#[cfg(target_arch = "wasm32")]
pub mod wasm {
    use wasm_bindgen::prelude::*;
    
    #[wasm_bindgen]
    pub fn init() {
        console_error_panic_hook::set_once();
    }
}

#[cfg(not(target_arch = "wasm32"))] 
pub mod native {
    // Здесь будет native-код с tokio/webrtc
}
