use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/payment")
            .route(web::get().to(|| async { "Payment endpoint" }))
    );
}