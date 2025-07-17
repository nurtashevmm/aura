use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/billing")
            .route(web::get().to(|| async { "Billing endpoint" }))
    );
}