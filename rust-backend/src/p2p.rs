use actix_web::{web, HttpResponse, Responder};
use crate::api::{AppState, PeerInfo};

pub async fn get_peers(state: web::Data<AppState>) -> impl Responder {
    let peers = state.p2p.as_ref().unwrap().get_connected_peers();
    HttpResponse::Ok().json(
        peers.iter().map(|p| PeerInfo {
            id: p.to_string(),
            address: "".to_string() // Временное значение
        }).collect::<Vec<_>>()
    )
}

pub async fn get_peers_count(state: web::Data<AppState>) -> impl Responder {
    let count = state.p2p.as_ref().unwrap().get_connected_peers().len();
    HttpResponse::Ok().json(count)
}
