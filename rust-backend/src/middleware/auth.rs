use actix_web::{dev::ServiceRequest, Error, FromRequest, HttpRequest};
use actix_web_httpauth::extractors::bearer::BearerAuth;

pub struct AuthMiddleware;

#[async_trait::async_trait]
impl FromRequest for AuthMiddleware {
    type Error = Error;
    type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(_req: &HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
        Box::pin(async move {
            // Auth logic here
            Ok(AuthMiddleware)
        })
    }
}

pub async fn validator(
    req: ServiceRequest,
    _credentials: BearerAuth
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    Ok(req)
}
