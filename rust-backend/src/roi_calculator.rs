use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RoiParameters {
    pub hardware_cost: f64,
    pub electricity_cost: f64,
    pub bandwidth_cost: f64,
    pub session_price: f64,
    pub avg_sessions_per_day: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoiResult {
    pub daily_profit: f64,
    pub breakeven_days: f64,
    pub monthly_profit: f64,
    pub yearly_profit: f64,
}

pub fn calculate_roi(params: RoiParameters) -> RoiResult {
    let daily_revenue = params.session_price * params.avg_sessions_per_day;
    let daily_cost = params.electricity_cost + params.bandwidth_cost;
    let daily_profit = daily_revenue - daily_cost;
    
    RoiResult {
        daily_profit,
        breakeven_days: params.hardware_cost / daily_profit,
        monthly_profit: daily_profit * 30.0,
        yearly_profit: daily_profit * 365.0,
    }
}
