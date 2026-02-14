#!/bin/bash
echo "Deploying DevForge Backend..."

# 1. Run tests
pytest tests/
if [ $? -ne 0 ]; then
    echo "Tests failed! Aborting deployment."
    exit 1
fi

# 2. Deploy CDK
cd infrastructure
npm run cdk deploy -- --require-approval never
cd ..

echo "Deployment finished!"
