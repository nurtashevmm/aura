use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct MoonlightClient {
    pub session_id: Uuid,
    pub connection_status: bool,
}

impl MoonlightClient {
    pub fn new() -> Self {
        Self {
            session_id: Uuid::new_v4(),
            connection_status: false,
        }
    }

    pub fn connect(&mut self) {
        self.connection_status = true;
    }
}
