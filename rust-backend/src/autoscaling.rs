use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadPrediction {
    pub timestamp: i64,
    pub predicted_load: f32,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ScalingDecision {
    ScaleUp,
    ScaleDown,
    Maintain,
}

pub struct AutoScaler;

impl AutoScaler {
    pub fn predict_load(&self, historical_data: &[f32]) -> LoadPrediction {
        // Simplified prediction model
        let last_load = *historical_data.last().unwrap_or(&0.0);
        let predicted_load = last_load * 1.1; // Simple 10% increase prediction
        
        LoadPrediction {
            timestamp: chrono::Utc::now().timestamp(),
            predicted_load,
            confidence: 0.8,
        }
    }

    pub fn make_scaling_decision(&self, current_load: f32, predicted_load: f32) -> ScalingDecision {
        if predicted_load > current_load * 1.5 {
            ScalingDecision::ScaleUp
        } else if predicted_load < current_load * 0.5 {
            ScalingDecision::ScaleDown
        } else {
            ScalingDecision::Maintain
        }
    }
}
