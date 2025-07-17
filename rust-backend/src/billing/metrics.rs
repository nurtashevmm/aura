use std::sync::atomic::{AtomicU64, Ordering};

pub struct PaymentMetrics {
    successful_payments: AtomicU64,
    failed_payments: AtomicU64,
}

impl PaymentMetrics {
    pub fn new() -> Self {
        PaymentMetrics {
            successful_payments: AtomicU64::new(0),
            failed_payments: AtomicU64::new(0),
        }
    }
}
