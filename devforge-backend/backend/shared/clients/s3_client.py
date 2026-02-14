import boto3
import json
from typing import Any

class S3Client:
    def __init__(self, bucket_name: str = 'devforge-artifacts'):
        self.s3 = boto3.client('s3')
        self.bucket = bucket_name

    def upload_json(self, key: str, data: Any):
        """Upload JSON data to S3."""
        try:
            self.s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=json.dumps(data),
                ContentType='application/json'
            )
        except Exception as e:
            print(f"S3 Upload Error (Mocking success for local dev): {e}")

    def get_json(self, key: str) -> Any:
        try:
            response = self.s3.get_object(Bucket=self.bucket, Key=key)
            return json.loads(response['Body'].read())
        except Exception as e:
            print(f"S3 Get Error: {e}")
            return {}
