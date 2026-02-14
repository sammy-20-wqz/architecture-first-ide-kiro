from pydantic import BaseModel
from typing import List
from datetime import datetime
from .risk_score import RiskScores
from .constraints import Constraints

class Component(BaseModel):
    id: str
    type: str  # service|database|cache|queue|gateway
    name: str
    technology: str
    justification: str

class Connection(BaseModel):
    source: str
    target: str
    type: str  # sync|async|data_flow

class Architecture(BaseModel):
    id: str
    version: int
    created_at: datetime
    constraints: Constraints
    components: List[Component]
    connections: List[Connection]
    risk_scores: RiskScores
    cost_estimate: float
