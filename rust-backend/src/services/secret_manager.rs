use std::sync::OnceLock;

static SECRET_STORE: OnceLock<SecretStore> = OnceLock::new();

pub struct SecretStore {
    agent_secret: String,
    jwt_secret: String,
    // другие секреты
}

impl SecretStore {
    pub fn global() -> &'static SecretStore {
        SECRET_STORE.get().expect("SecretStore not initialized")
    }
    
    pub fn init() -> Result<(), String> {
        let store = SecretStore {
            agent_secret: std::env::var("AGENT_SECRET")
                .map_err(|_| "AGENT_SECRET not set")?,
            jwt_secret: std::env::var("JWT_SECRET")
                .map_err(|_| "JWT_SECRET not set")?,
        };
        
        SECRET_STORE.set(store)
            .map_err(|_| "SecretStore already initialized")?;
        
        Ok(())
    }
    
    pub fn get_agent_secret(&self) -> &str {
        &self.agent_secret
    }
    
    pub fn get_jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}
