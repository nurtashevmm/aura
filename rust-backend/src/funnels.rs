use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FunnelStage {
    pub name: String,
    pub visitors: u32,
    pub conversions: u32,
    pub dropoff_rate: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Funnel {
    pub id: String,
    pub name: String,
    pub stages: Vec<FunnelStage>,
    pub total_conversion_rate: f32,
}

pub struct FunnelService;

impl FunnelService {
    pub fn get_funnel(&self, funnel_id: &str) -> Option<Funnel> {
        // In a real implementation, this would fetch from analytics storage
        Some(Funnel {
            id: funnel_id.to_string(),
            name: "Player Onboarding".to_string(),
            stages: vec![
                FunnelStage {
                    name: "Landing Page".to_string(),
                    visitors: 1000,
                    conversions: 800,
                    dropoff_rate: 0.2,
                },
                FunnelStage {
                    name: "Registration".to_string(),
                    visitors: 800,
                    conversions: 500,
                    dropoff_rate: 0.375,
                },
                FunnelStage {
                    name: "First Payment".to_string(),
                    visitors: 500,
                    conversions: 200,
                    dropoff_rate: 0.6,
                },
            ],
            total_conversion_rate: 0.2,
        })
    }
}
