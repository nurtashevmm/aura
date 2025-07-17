use actix_web::{web, HttpResponse, Responder};
use sqlx::Row;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::Serialize;

use crate::api::core::{TopUpRequest, SessionRequest, HeartbeatPayload, StatsSummary};
use crate::api::SqliteAppState;

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    status: String,
    timestamp: String,
    components: Vec<ComponentHealth>,
}

#[derive(Debug, Serialize)]
pub struct ComponentHealth {
    name: String,
    status: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<serde_json::Value>,
}

pub async fn health(state: web::Data<SqliteAppState>) -> impl Responder {
    let mut components = Vec::new();
    
    // Database health check
    let db_status = match sqlx::query("SELECT 1").execute(&state.db_pool).await {
        Ok(_) => ComponentHealth {
            name: "Database".to_string(),
            status: "healthy".to_string(),
            message: "Connection successful".to_string(),
            details: None,
        },
        Err(e) => ComponentHealth {
            name: "Database".to_string(),
            status: "unhealthy".to_string(),
            message: format!("Connection failed: {}", e),
            details: None,
        },
    };
    components.push(db_status);
    
    // Overall status
    let overall_status = if components.iter().all(|c| c.status == "healthy") {
        "healthy"
    } else {
        "degraded"
    };
    
    HttpResponse::Ok().json(HealthResponse {
        status: overall_status.to_string(),
        timestamp: Utc::now().to_rfc3339(),
        components,
    })
}

pub async fn health_db(state: web::Data<crate::api::SqliteAppState>) -> impl Responder {
    match sqlx::query("SELECT sqlite_version()")
        .fetch_one(&state.db_pool)
        .await 
    {
        Ok(row) => HttpResponse::Ok().json(json!({
            "status": "healthy",
            "version": row.get::<String, _>(0),
            "timestamp": Utc::now().to_rfc3339()
        })),
        Err(e) => HttpResponse::ServiceUnavailable().json(json!({
            "status": "unhealthy",
            "error": e.to_string(),
            "timestamp": Utc::now().to_rfc3339()
        }))
    }
}

pub async fn balance_top_up(
    data: web::Data<SqliteAppState>,
    payload: web::Json<TopUpRequest>,
) -> impl Responder {
    if let Err(e) = sqlx::query("UPDATE users SET balance = balance + ? WHERE id = 1")
        .bind(payload.amount)
        .execute(&data.db_pool)
        .await
    {
        eprintln!("top_up error: {e}");
        return HttpResponse::InternalServerError().finish();
    }
    HttpResponse::Ok().finish()
}

pub async fn session_start(
    data: web::Data<SqliteAppState>,
    payload: web::Json<SessionRequest>,
) -> impl Responder {
    if let Err(e) = sqlx::query("INSERT INTO sessions (pc_id, started_at) VALUES (?, CURRENT_TIMESTAMP)")
        .bind(&payload.pc_id)
        .execute(&data.db_pool)
        .await
    {
        eprintln!("session_start error: {e}");
        return HttpResponse::InternalServerError().finish();
    }
    HttpResponse::Ok().finish()
}

pub async fn session_stop(
    data: web::Data<SqliteAppState>,
    payload: web::Json<SessionRequest>,
) -> impl Responder {
    if let Err(e) = sqlx::query("UPDATE sessions SET ended_at = CURRENT_TIMESTAMP WHERE pc_id = ? AND ended_at IS NULL")
        .bind(&payload.pc_id)
        .execute(&data.db_pool)
        .await
    {
        eprintln!("session_stop error: {e}");
        return HttpResponse::InternalServerError().finish();
    }
    HttpResponse::Ok().finish()
}

pub async fn billing_tick(data: web::Data<SqliteAppState>) -> impl Responder {
    // Simple billing: decrement 5 cents per active session minute (SQLite version)
    if let Err(e) = sqlx::query(
        "UPDATE users SET balance = balance - 0.05 
         WHERE id IN (SELECT user_id FROM active_sessions)"
    )
    .execute(&data.db_pool)
    .await
    {
        eprintln!("billing_tick error: {e}");
        return HttpResponse::InternalServerError().finish();
    }
    HttpResponse::Ok().finish()
}

pub async fn merchant_heartbeat(
    data: web::Data<SqliteAppState>,
    payload: web::Json<HeartbeatPayload>,
) -> impl Responder {
    if let Err(e) = sqlx::query("INSERT INTO heartbeats (pc_id, sessions_active, ts) VALUES (?, ?, CURRENT_TIMESTAMP)")
        .bind(&payload.pc_id)
        .bind(payload.sessions_active as i32)
        .execute(&data.db_pool)
        .await
    {
        eprintln!("heartbeat error: {e}");
        return HttpResponse::InternalServerError().finish();
    }
    HttpResponse::Ok().finish()
}

pub async fn stats_summary(
    data: web::Data<SqliteAppState>,
) -> actix_web::Result<HttpResponse> {
    let row = sqlx::query(
        "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE ended_at IS NULL) AS active FROM sessions"
    )
    .fetch_one(&data.db_pool)
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;
    
    Ok(HttpResponse::Ok().json(StatsSummary {
        sessions_total: row.get::<i64, _>(0),
        active_sessions: row.get::<i64, _>(1),
    }))
}

#[cfg(feature = "p2p")]
pub async fn health_p2p(state: web::Data<SqliteAppState>) -> impl Responder {
    use actix_web::{HttpResponse, Responder};
    use serde_json::json;

    match state.p2p.as_ref() {
        Some(p2p) => HttpResponse::Ok().json(json!({
            "status": "healthy",
            "peers": p2p.get_connected_peers().len()
        })),
        None => HttpResponse::ServiceUnavailable().json(json!({
            "status": "unavailable",
            "reason": "P2P service not initialized"
        }))
    }
}

pub async fn health_full(state: web::Data<crate::api::SqliteAppState>) -> impl Responder {
    let mut components = Vec::new();
    
    // Database check
    components.push(match sqlx::query("SELECT 1").execute(&state.db_pool).await {
        Ok(_) => ComponentHealth {
            name: "Database".to_string(),
            status: "healthy".to_string(),
            message: "Connection successful".to_string(),
            details: None,
        },
        Err(e) => ComponentHealth {
            name: "Database".to_string(),
            status: "unhealthy".to_string(),
            message: format!("Connection failed: {}", e),
            details: None,
        },
    });
    
    // P2P check (if enabled)
    #[cfg(feature = "p2p")]
    if let Some(p2p) = &state.p2p {
        components.push(ComponentHealth {
            name: "P2P Network".to_string(),
            status: "healthy".to_string(),
            message: format!("{} connected peers", p2p.get_connected_peers().len()),
            details: Some(json!({ "bandwidth": p2p.get_network_stats().bandwidth })),
        });
    }
    
    // Overall status
    let overall_status = if components.iter().all(|c| c.status == "healthy") {
        "healthy"
    } else {
        "degraded"
    };
    
    HttpResponse::Ok().json(HealthResponse {
        status: overall_status.to_string(),
        timestamp: Utc::now().to_rfc3339(),
        components,
    })
}
use serde_json::json;
