import pytest
from logistics_engine import TomTomDataIngestor, XGBoostRiskPredictor

def test_ingestor_initialization():
    ingestor = TomTomDataIngestor()
    assert ingestor.api_key is not None

def test_risk_predictor_initialization():
    predictor = XGBoostRiskPredictor()
    assert predictor.model is not None

def test_predict_risk_logic():
    predictor = XGBoostRiskPredictor()
    
    mock_route = {
        'lengthInMeters': 12000,
        'travelTimeInSeconds': 850
    }
    
    risk = predictor.predict_risk(mock_route)
    assert risk in ['Low Risk', 'Medium Risk', 'High Risk']
    
def test_predict_risk_empty_data():
    predictor = XGBoostRiskPredictor()
    risk = predictor.predict_risk(None)
    assert risk == "Unknown Risk"