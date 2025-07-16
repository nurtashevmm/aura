use uuid::Uuid;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Balance {
    pub user_id: Uuid,
    pub amount: Decimal,
    pub last_update: DateTime<Utc>
}

#[derive(Debug, Clone)]
pub struct PaymentSystem {
    balances: HashMap<Uuid, Decimal>,
}

impl PaymentSystem {
    pub fn new() -> Self {
        Self {
            balances: HashMap::new(),
        }
    }

    pub fn add_funds(&mut self, user_id: Uuid, amount: Decimal) {
        *self.balances.entry(user_id).or_insert(Decimal::ZERO) += amount;
    }
}
