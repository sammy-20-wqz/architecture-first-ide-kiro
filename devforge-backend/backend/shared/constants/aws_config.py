import os

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
DYNAMODB_TABLE_PREFIX = os.environ.get("TABLE_PREFIX", "devforge-")
S3_BUCKET_NAME = os.environ.get("ARTIFACT_BUCKET", "devforge-artifacts")
