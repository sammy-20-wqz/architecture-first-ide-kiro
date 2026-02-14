# DevForge Backend

Python-based AWS Lambda backend for architecture validation and risk scoring.

## Structure
- `backend/` - Lambda functions
- `analysis-engine/` - Code analysis logic
- `ai-agents/` - AI orchestration
- `infrastructure/` - AWS CDK (TypeScript)
- `database/` - Database schemas
- `workflows/` - n8n workflows
- `scripts/` - Utility scripts

## Setup
```bash
pip install -r requirements.txt
python -m pytest tests/
```

## API Endpoints
- POST /api/analyze - Analyze code
- POST /api/blueprint/generate - Generate architecture
- POST /api/risk/calculate - Calculate risk scores
- POST /api/drift/check - Check architecture drift
- POST /api/cost/estimate - Estimate AWS costs
- POST /api/security/scan - Security vulnerability scan
