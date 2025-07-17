mod api;
mod billing;
#[cfg(feature = "p2p")]
mod p2p;

use actix_web::{web, App, HttpServer};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::fs::File;
use std::io::BufReader;
use std::str::FromStr;
use rustls_pemfile::{certs, pkcs8_private_keys};
use rustls::{Certificate, PrivateKey, ServerConfig};
use config::Config;
use tokio::time::Duration;
use billing::{BillingService, PaymentMetrics};

#[cfg(feature = "sqlite")]
use crate::api::SqliteAppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    // ------------------ Load configuration ------------------
    let settings = Config::builder()
        .add_source(config::File::with_name("config/prod").required(false))
        .add_source(config::File::with_name("config/tls").required(false))
        .build()
        .expect("Failed to load configuration files");

    let host: String = settings
        .get::<String>("server.host")
        .unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = settings
        .get::<u16>("server.port")
        .unwrap_or(8080);

    // ------------------ Init DB ------------------
    let database_url = settings
        .get::<String>("database.url")
        .unwrap_or_else(|_| "sqlite:aura.db".into());

    #[cfg(feature = "sqlite")]
    let db_pool = SqlitePool::connect_with(
        SqliteConnectOptions::from_str(&database_url)?
            .create_if_missing(true)
            .busy_timeout(Duration::from_secs(30))
    ).await?;
    #[cfg(feature = "sqlite")]
    let state = api::SqliteAppState::new(db_pool.clone());
    #[cfg(feature = "sqlite")]
    let db = db_pool.clone();

    // Start background billing
    let billing = BillingService::new();
    #[cfg(feature = "sqlite")] {
        billing.start_billing_ticker(db_pool.clone()).await;
        tokio::spawn(async move {
            billing.start_payment_processor(db_pool.clone()).await;
        });
    }

    // Initialize metrics
    #[cfg(feature = "sqlite")]
    let payment_metrics = web::Data::new(PaymentMetrics::new());

    // Start background services
    // Removed duplicate billing service call

    // ------------------ Background billing tick ------------------
    {
        #[cfg(feature = "sqlite")]
        let db = db.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                if let Err(e) = sqlx::query(
                    "UPDATE sessions SET status = 'billed' WHERE status = 'active' AND ended_at < CURRENT_TIMESTAMP"
                )
                    .execute(&db)
                    .await
                {
                    eprintln!("billing tick error: {e}");
                }
            }
        });
    }

    // ------------------ Build server factory ------------------
    let listen_addr = format!("{}:{}", host, port);

    let tls_cert: Option<String> = settings.get::<String>("tls.cert_file").ok();
    let tls_key: Option<String> = settings.get::<String>("tls.key_file").ok();

    if let (Some(cert_path), Some(key_path)) = (tls_cert, tls_key) {
        let cert_file = &mut BufReader::new(File::open(cert_path)?);
        let key_file = &mut BufReader::new(File::open(key_path)?);
        
        let cert_chain = certs(cert_file)?
            .into_iter()
            .map(Certificate)
            .collect::<Vec<_>>();
        
        let mut keys = pkcs8_private_keys(key_file)?
            .into_iter()
            .map(PrivateKey)
            .collect::<Vec<_>>();
        
        let config = ServerConfig::builder()
            .with_safe_defaults()
            .with_no_client_auth()
            .with_single_cert(cert_chain, keys.remove(0))?;
            
        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(state.clone()))
                .configure(crate::api::configure)
        })
        .bind_rustls_021(listen_addr, config)?
        .run()
        .await?;
    } else {
        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(state.clone()))
                .configure(crate::api::configure)
        })
        .bind(listen_addr)?
        .run()
        .await?;
    }
    
    Ok(())
}
