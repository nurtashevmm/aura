use clap::Parser;
use reqwest::Client;
use serde::Serialize;
use std::time::Duration;
use tokio::process::Command;
use tokio::time::sleep;

#[derive(Parser)]
#[command(version, about = "AURA Merchant Agent: heartbeat + autostart Sunshine/Tailscale")] 
struct Args {
    /// Backend base URL, e.g. http://localhost:8080
    #[arg(long, default_value_t = String::from("http://localhost:8080"))]
    backend: String,

    /// Merchant PC identifier (hostname)
    #[arg(long, default_value_t = hostname::get().unwrap_or_default().to_string_lossy().to_string())]
    pc_id: String,

    /// Heartbeat interval seconds
    #[arg(long, default_value_t = 15)]
    interval: u64,
}

#[derive(Serialize)]
pub struct HeartbeatPayload<'a> {
    pc_id: &'a str,
    sessions_active: u32,
}

async fn send_heartbeat(client: &Client, args: &Args) -> Result<(), reqwest::Error> {
    let payload = HeartbeatPayload {
        pc_id: &args.pc_id,
        sessions_active: 0,
    };
    let url = format!("{}/api/merchant/heartbeat", args.backend);
    client.post(url).json(&payload).send().await?;
    Ok(())
}

async fn start_tailscale() {
    let _ = Command::new("tailscale").arg("up").spawn();
}

async fn start_sunshine() {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("powershell")
            .args(["-Command", "Start-Process -FilePath \"C:/Program Files/Sunshine/sunshine.exe\""])
            .spawn();
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let client = Client::new();

    start_tailscale().await;
    start_sunshine().await;

    loop {
        if let Err(e) = send_heartbeat(&client, &args).await {
            eprintln!("heartbeat error: {e}");
        }
        sleep(Duration::from_secs(args.interval)).await;
    }
}
