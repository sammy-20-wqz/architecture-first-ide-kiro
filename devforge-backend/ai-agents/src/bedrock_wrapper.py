# Wrapper specifically for the AI agents module, possibly extending shared one
from typing import Dict, Any

class BedrockWrapper:
    def invoke_model(self, prompt: str) -> str:
        return "Mock Bedrock response"
