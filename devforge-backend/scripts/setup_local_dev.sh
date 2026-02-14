#!/bin/bash
echo "Setting up DevForge local environment..."

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install CDK dependencies
cd infrastructure
npm install
cd ..

# 3. Create .env file for local dev
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "AWS_REGION=us-east-1" > .env
    echo "DYNAMODB_TABLE_PREFIX=devforge-local" >> .env
fi

echo "Setup complete! Run 'npm run cdk deploy' in infrastructure/ to deploy."
