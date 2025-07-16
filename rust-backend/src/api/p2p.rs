use axum::{Router, routing::get, extract::Extension, Json};
use aura_p2p::P2pService;

pub fn p2p_routes(p2p: Arc<P2pService>) -> Router {
    Router::new()
        .route("/peers", get(list_peers))
        .route("/peers/count", get(count_peers))
        .route("/stats", get(get_stats))
        .route("/stats/bandwidth", get(get_bandwidth))
        .layer(Extension(p2p))
}

async fn list_peers(Extension(p2p): Extension<Arc<P2pService>>) -> Json<Vec<String>> {
    Json(p2p.get_connected_peers().into_iter().map(|p| p.to_string()).collect())
}

async fn count_peers(Extension(p2p): Extension<Arc<P2pService>>) -> Json<usize> {
    Json(p2p.get_connected_peers().len())
}

async fn get_stats(Extension(p2p): Extension<Arc<P2pService>>) -> Json<NetworkStats> {
    Json(p2p.get_network_stats())
}

async fn get_bandwidth(Extension(p2p): Extension<Arc<P2pService>>) -> Json<(u64, u64)> {
    let stats = p2p.get_network_stats();
    Json((stats.bytes_sent, stats.bytes_received))
}
