use actix_web::web;
use aura_p2p::P2pService;
use std::sync::Arc;

pub mod auth;
pub mod billing;
pub mod payment;
pub mod ocr;

#[cfg(feature = "p2p")]
use aura_p2p::P2PService;

#[cfg(feature = "postgres")]
pub struct PostgresAppState {
    pub db_pool: sqlx::PgPool,
}

#[cfg(feature = "postgres")]
impl Clone for PostgresAppState {
    fn clone(&self) -> Self {
        Self {
            db_pool: self.db_pool.clone(),
        }
    }
}

#[cfg(feature = "postgres")]
impl PostgresAppState {
    pub fn new(db_pool: sqlx::PgPool) -> Self {
        Self {
            db_pool,
        }
    }
}

#[cfg(feature = "postgres")]
pub async fn health(_data: web::Data<PostgresAppState>) -> impl actix_web::Responder {
    actix_web::HttpResponse::Ok().json("OK")
}

pub mod core;
pub mod handlers;

#[cfg(feature = "sqlite")]
pub mod sqlite;

#[cfg(feature = "sqlite")]
#[derive(Clone)]
pub struct SqliteAppState {
    pub db_pool: sqlx::SqlitePool,
    #[cfg(feature = "p2p")]
    pub p2p: Option<Arc<P2pService>>
}

#[cfg(feature = "sqlite")]
impl SqliteAppState {
    pub fn new(db_pool: sqlx::SqlitePool) -> Self {
        Self {
            db_pool,
            #[cfg(feature = "p2p")]
            p2p: None,
        }
    }
}

#[cfg(feature = "postgres")]
pub mod postgres;

#[cfg(feature = "postgres")]
pub use core::postgres::*;

#[cfg(feature = "sqlite")]
pub fn configure(cfg: &mut web::ServiceConfig) {
    use actix_web::web;
    use crate::api::handlers::sqlite;
    
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(sqlite::health))
            .route("/health/db", web::get().to(sqlite::health_db))
            // .route("/health/p2p", web::get().to(sqlite::health_p2p))
            .route("/health/p2p", web::get().to(|| async { "P2P health check temporarily disabled" }))
            .route("/health/full", web::get().to(sqlite::health_full))
            .route("/balance/topup", web::post().to(sqlite::balance_top_up))
            .route("/session/start", web::post().to(sqlite::session_start))
            .route("/session/stop", web::post().to(sqlite::session_stop))
            .route("/billing/tick", web::post().to(sqlite::billing_tick))
            .route("/merchant/heartbeat", web::post().to(sqlite::merchant_heartbeat))
            .route("/stats/summary", web::get().to(sqlite::stats_summary))
            .service(web::scope("/ocr").configure(crate::api::ocr::config)),
    );
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(auth::config)
            .configure(billing::config)
            .configure(payment::config)
            .configure(ocr::config)
    );
}
