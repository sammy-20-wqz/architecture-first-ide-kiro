import re

def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def validate_project_name(name: str) -> bool:
    return len(name) >= 3 and name.isalnum()

def validate_aws_region(region: str) -> bool:
    valid_regions = ["us-east-1", "us-west-2", "eu-west-1"]
    return region in valid_regions
