mod api;
#[cfg(feature = "p2p")]
mod p2p;

use actix_web::{web, App, HttpServer};
use aura_p2p::P2PService;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    #[cfg(feature = "p2p")]
    let p2p_service = Arc::new(
        aura_p2p::P2PService::new()
            .expect("Failed to initialize P2P service")
    );
    
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://user:pass@localhost/aura")
        .await
        .expect("Failed to connect to database");
    
    let state = api::AppState::new(
        #[cfg(feature = "p2p")] Some(p2p_service),
        db_pool
    );
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .configure(api::create_api)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
