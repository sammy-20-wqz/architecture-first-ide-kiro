from pydantic import BaseModel, Field
from typing import Optional

class ArchitectureViolation(BaseModel):
    type: str = Field(description="Type of violation e.g. drift, security, pattern")
    severity: str = Field(description="low|medium|high|critical")
    description: str
    component_id: Optional[str] = None
    suggestion: Optional[str] = None
