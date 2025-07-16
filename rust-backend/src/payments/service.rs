use super::Balance;
use uuid::Uuid;

pub struct PaymentService {
    balances: std::collections::HashMap<Uuid, Balance>,
}

impl PaymentService {
    pub fn new() -> Self {
        Self {
            balances: std::collections::HashMap::new(),
        }
    }
}
