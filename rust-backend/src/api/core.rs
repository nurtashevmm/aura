use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::Row;

#[derive(Debug, Deserialize)]
pub struct TopUpRequest {
    pub amount: f64,
}

#[derive(Debug, Deserialize)]
pub struct SessionRequest {
    pub pc_id: String,
}

#[derive(Debug, Deserialize)]
pub struct HeartbeatPayload {
    pub pc_id: String,
    pub sessions_active: usize,
}

#[derive(Debug, Serialize)]
pub struct StatsSummary {
    pub sessions_total: i64,
    pub active_sessions: i64,
}

#[cfg(feature = "sqlite")]
pub mod sqlite {
    use super::*;
    use crate::api::SqliteAppState;
    use sqlx;

    pub async fn balance_top_up(
        data: web::Data<SqliteAppState>,
        payload: web::Json<TopUpRequest>,
    ) -> impl Responder {
        // naive balance update for user_id=1
        if let Err(e) = sqlx::query("UPDATE users SET balance = balance + $1 WHERE id = 1")
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
        if let Err(e) = sqlx::query("INSERT INTO sessions (pc_id, started_at) VALUES ($1, NOW())")
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
        if let Err(e) = sqlx::query("UPDATE sessions SET ended_at = NOW() WHERE pc_id = $1 AND ended_at IS NULL")
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
        // Simple billing: decrement 5 cents per active session minute
        if let Err(e) = sqlx::query("CALL bill_active_sessions()")
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
        if let Err(e) = sqlx::query("INSERT INTO heartbeats (pc_id, sessions_active, ts) VALUES ($1, $2, NOW())")
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

    pub async fn health(_data: web::Data<SqliteAppState>) -> impl Responder {
        HttpResponse::Ok().json("OK")
    }
}
