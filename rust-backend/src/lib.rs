use actix_web::{web, App, HttpServer};
#[cfg(feature = "p2p")]
use aura_p2p::P2PService;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

pub mod models;
pub mod middleware;
pub mod services;
pub mod api;
pub mod p2p;

pub async fn run() -> std::io::Result<()> {
    // Initialize P2P service
    #[cfg(feature = "p2p")]
    let p2p_service = Arc::new(P2PService::new().expect("Failed to initialize P2P service"));
    
    // Initialize database pool
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect_lazy("postgres://user:pass@localhost/db")
        .unwrap();
    
    let state = api::AppState::new(
        #[cfg(feature = "p2p")]
        p2p_service,
        db_pool
    );
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/p2p")
                            .route("/peers", web::get().to(p2p::get_peers))
                            .route("/peers/count", web::get().to(p2p::get_peers_count))
                    )
            )
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
