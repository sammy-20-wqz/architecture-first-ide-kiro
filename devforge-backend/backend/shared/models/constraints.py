from pydantic import BaseModel, Field
from typing import Dict

class Constraints(BaseModel):
    expected_scale: Dict[str, int] = Field(
        description="Current and projected user counts"
    )
    budget_monthly: float = Field(description="Monthly budget in USD")
    team_size: int = Field(description="Number of developers")
    deployment_frequency: str = Field(description="daily|weekly|monthly")
    compliance_requirements: list[str] = Field(default=[], description="GDPR, HIPAA, etc.")
