use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use crate::models::roles::{UserRole, Permission};

pub async fn check_permission(
    req: &ServiceRequest,
    required: Permission
) -> Result<(), Error> {
    let roles = req.extensions()
        .get::<Vec<UserRole>>()
        .ok_or_else(|| 
            actix_web::error::ErrorForbidden("No roles assigned")
        )?;
    
    if roles.iter().any(|role| role.has_permission(required)) {
        Ok(())
    } else {
        Err(actix_web::error::ErrorForbidden("Insufficient permissions"))
    }
}

pub fn extract_roles_from_token(
    req: &ServiceRequest,
    token: &str
) -> Result<Vec<UserRole>, Error> {
    // В реальной реализации здесь будет декодирование JWT
    // и извлечение ролей из токена
    
    // Заглушка для демонстрации
    Ok(vec![UserRole::Merchant])
}
