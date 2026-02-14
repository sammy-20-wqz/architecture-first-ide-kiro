import json
from typing import Dict, Any
from shared.clients.bedrock_client import BedrockClient
from shared.models.architecture import Architecture
from shared.utils.logger import Logger

logger = Logger(__name__)
bedrock = BedrockClient()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generates an architecture blueprint based on requirements.
    POST /api/blueprint/generate
    """
    try:
        body = json.loads(event.get('body', '{}'))
        requirements = body.get('requirements')
        
        logger.info(f"Generating blueprint for requirements: {requirements[:50]}...")
        
        # Mock AI generation
        prompt = f"Generate an architecture blueprint for: {requirements}"
        ai_response = bedrock.invoke(prompt)
        
        # Mock structured response as if parsed from AI
        blueprint = {
            "id": "arch-12345",
            "name": "Generated Architecture",
            "components": [
                {"id": "c1", "type": "service", "name": "API Gateway", "technology": "AWS API Gateway"},
                {"id": "c2", "type": "compute", "name": "Backend Logic", "technology": "AWS Lambda"},
                {"id": "c3", "type": "database", "name": "Main DB", "technology": "DynamoDB"}
            ],
            "connections": [
                {"source": "c1", "target": "c2", "type": "sync"},
                {"source": "c2", "target": "c3", "type": "data_access"}
            ]
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps({'blueprint': blueprint, 'ai_commentary': ai_response})
        }
    except Exception as e:
        logger.error(f"Error generating blueprint: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
