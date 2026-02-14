import pytest
import json
from functions.calculate_risk import handler

def test_calculate_risk_handler():
    event = {
        "body": json.dumps({
            "architecture": {"id": "test-arch"}
        })
    }
    
    response = handler.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    scores = json.loads(response['body'])
    assert scores['architecture_risk'] >= 0
    assert scores['security_posture'] >= 0
