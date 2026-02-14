import pytest
import json
from unittest.mock import MagicMock
from functions.analyze_code import handler

def test_analyze_code_handler():
    # Mock context
    context = MagicMock()
    context.aws_request_id = "test-req-id"
    
    # Mock event
    event = {
        "body": json.dumps({
            "code": "print('hello')",
            "language": "python",
            "architecture_id": "arch-1"
        })
    }
    
    response = handler.lambda_handler(event, context)
    
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert "analysis" in body
    assert "risk_scores" in body
    assert body["request_id"] == "test-req-id"
