use thiserror::Error;
use axum::response::{IntoResponse, Response};
use axum::http::StatusCode;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Authentication failed")]
    AuthenticationFailed,
    #[error("Permission denied")]
    PermissionDenied,
    #[error("Invalid role")]
    InvalidRole,
    #[error("Database error")]
    DatabaseError(#[from] sqlx::Error),
    #[error("Missing auth header")]
    MissingAuthHeader,
    #[error("Invalid auth header")]
    InvalidAuthHeader,
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Forbidden")]
    Forbidden,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let status = match self {
            AuthError::AuthenticationFailed => StatusCode::UNAUTHORIZED,
            AuthError::PermissionDenied => StatusCode::FORBIDDEN,
            AuthError::InvalidRole => StatusCode::BAD_REQUEST,
            AuthError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::MissingAuthHeader => StatusCode::BAD_REQUEST,
            AuthError::InvalidAuthHeader => StatusCode::BAD_REQUEST,
            AuthError::Unauthorized => StatusCode::UNAUTHORIZED,
            AuthError::Forbidden => StatusCode::FORBIDDEN,
        };
        
        (status, self.to_string()).into_response()
    }
}
