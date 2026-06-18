"""S3 helpers for the pipeline worker."""
import os
import boto3

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION", "us-east-2"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

RAW_BUCKET = os.getenv("AWS_S3_BUCKET_RAW") or os.getenv("AWS_S3_BUCKET", "egocentric-raw-videos")
# Default to same bucket as raw — processed/ prefix keeps them separate
PROCESSED_BUCKET = os.getenv("AWS_S3_BUCKET_PROCESSED") or RAW_BUCKET

def download_clip(s3_key: str, local_path: str):
    s3.download_file(RAW_BUCKET, s3_key, local_path)

def upload_clip(local_path: str, s3_key: str):
    s3.upload_file(local_path, PROCESSED_BUCKET, s3_key)
