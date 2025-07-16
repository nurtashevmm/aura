use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WhiteLabelConfig {
    pub company_name: String,
    pub primary_color: String,
    pub secondary_color: String,
    pub logo_url: String,
    pub custom_domain: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnterpriseClient {
    pub id: String,
    pub name: String,
    pub config: WhiteLabelConfig,
    pub api_keys: Vec<String>,
}

pub struct EnterpriseService;

impl EnterpriseService {
    pub fn create_client(&self, name: &str, config: WhiteLabelConfig) -> EnterpriseClient {
        EnterpriseClient {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            config,
            api_keys: vec![uuid::Uuid::new_v4().to_string()],
        }
    }
}
