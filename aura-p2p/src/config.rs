use libp2p::swarm::SwarmConfig;
use serde::{Deserialize, Serialize};

/// Конфигурация P2P сервиса
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct P2pConfig {
    /// Порт для прослушивания
    pub listen_port: u16,
    /// Максимальное количество подключений
    pub max_connections: u32,
    /// Время ожидания ping (мс)
    pub ping_timeout_ms: u64,
    /// Базовый конфиг Swarm
    pub swarm_config: SwarmConfig,
}

impl Default for P2pConfig {
    fn default() -> Self {
        Self {
            listen_port: 0, // 0 = случайный порт
            max_connections: 100,
            ping_timeout_ms: 5000,
            swarm_config: SwarmConfig::without_executor(),
        }
    }
}
