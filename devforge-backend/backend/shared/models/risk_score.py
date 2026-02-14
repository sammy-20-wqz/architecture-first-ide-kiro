from pydantic import BaseModel, Field

class RiskScores(BaseModel):
    architecture_risk: int = Field(ge=0, le=10, description="Overall architecture risk")
    security_posture: int = Field(ge=0, le=10, description="Security vulnerability score")
    scalability_readiness: int = Field(ge=0, le=10, description="Ability to scale")
    overengineering_risk: str = Field(description="low|medium|high")
    cost_efficiency: int = Field(ge=0, le=10, default=5, description="Cost efficiency score")
