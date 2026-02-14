import json
from typing import Dict, Any
from shared.clients.bedrock_client import BedrockClient
from shared.utils.logger import Logger

logger = Logger(__name__)
# Initialize Bedrock for AI mentor persona
bedrock = BedrockClient()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handles AI Mentor interactions.
    POST /api/mentor/chat
    """
    try:
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message')
        context_data = body.get('context', {})
        
        logger.info(f"Mentor chat: {user_message[:30]}...")
        
        prompt = f"""
        You are an expert software architect mentor.
        Context: {json.dumps(context_data)}
        User Question: {user_message}
        
        Provide a helpful, educational response.
        """
        
        ai_response = bedrock.invoke(prompt)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'response': ai_response,
                'suggested_actions': ["Review Architecture Patterns", "See Example Implementation"]
            })
        }
    except Exception as e:
        logger.error(f"Error in mentor console: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
