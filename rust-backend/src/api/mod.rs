use actix_web::{web, HttpResponse, Responder, error};
use serde::{Serialize, Deserialize};
#[cfg(feature = "p2p")]
use aura_p2p::P2PService;
#[cfg(feature = "p2p")]
use libp2p::PeerId;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    #[cfg(feature = "p2p")]
    pub p2p: Option<Arc<P2PService>>,
    pub db: PgPool,
}

impl AppState {
    pub fn new(
        #[cfg(feature = "p2p")] p2p: Option<Arc<P2PService>>,
        db: PgPool
    ) -> Self {
        Self {
            #[cfg(feature = "p2p")]
            p2p,
            db
        }
    }
}

#[derive(Serialize)]
pub struct PeerInfo {
    pub id: String,
    pub address: String,
}

#[derive(Deserialize)]
pub struct SendMessage {
    pub topic: String,
    pub message: Vec<u8>,
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(json!({ "status": "ok" }))
}

pub fn create_api(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/p2p/peers", web::get().to(list_peers))
            .route("/p2p/peers/count", web::get().to(list_peers_count))
            .route("/p2p/send", web::post().to(send_message))
    );
}

pub async fn list_peers(data: web::Data<AppState>) -> impl Responder {
    #[cfg(feature = "p2p")]
    let peers = data.p2p.as_ref().unwrap().get_connected_peers();
    #[cfg(not(feature = "p2p"))]
    let peers = Vec::new();
    HttpResponse::Ok().json(
        peers.iter().map(|p| PeerInfo {
            id: p.to_string(),
            address: "".to_string(),
        }).collect::<Vec<_>>()
    )
}

pub async fn list_peers_count(data: web::Data<AppState>) -> impl Responder {
    #[cfg(feature = "p2p")]
    let count = data.p2p.as_ref().unwrap().get_connected_peers().len();
    #[cfg(not(feature = "p2p"))]
    let count = 0;
    HttpResponse::Ok().json(count)
}

pub async fn send_message(
    data: web::Data<AppState>,
    payload: web::Json<SendMessage>,
) -> impl Responder {
    #[cfg(feature = "p2p")]
    match data.p2p.as_ref().unwrap().send(payload.topic.clone(), payload.message.clone()) {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => HttpResponse::BadRequest().body(e.to_string()),
    }
    #[cfg(not(feature = "p2p"))]
    HttpResponse::NotFound().finish()
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
    cfg.service(
        web::scope("/api")
            .route("/p2p/peers", web::get().to(list_peers))
            .route("/p2p/peers/count", web::get().to(list_peers_count))
            .route("/p2p/send", web::post().to(send_message))
    );
}
