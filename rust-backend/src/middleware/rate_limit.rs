use actix_web::{dev::ServiceRequest, Error};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use redis::{Commands, RedisError};
use std::time::{SystemTime, UNIX_EPOCH};

pub struct RateLimiter {
    redis_client: redis::Client,
}

impl RateLimiter {
    pub fn new(redis_url: &str) -> Result<Self, RedisError> {
        let client = redis::Client::open(redis_url)?;
        Ok(RateLimiter {
            redis_client: client,
        })
    }

    pub async fn check_rate_limit(
        &self,
        req: &ServiceRequest,
        key: &str,
        limit: u32,
        window: u32,
    ) -> Result<bool, RedisError> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let mut conn = self.redis_client.get_connection()?;
        
        // Remove old requests
        let _: () = conn.zremrangebyscore(key, 0, (now - window as u64) as i64)?;
        
        // Count current requests
        let count: u32 = conn.zcard(key)?;
        
        if count >= limit {
            Ok(false)
        } else {
            // Add new request
            let _: () = conn.zadd(key, now, now)?;
            let _: () = conn.expire(key, window)?;
            Ok(true)
        }
    }
}
