use actix_cors::Cors;
use actix_web::http::header;

pub fn configure_cors() -> Cors {
    Cors::default()
        .allowed_origin("https://aura.gg")
        .allowed_origin("https://www.aura.gg")
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
        ])
        .max_age(3600)
}
