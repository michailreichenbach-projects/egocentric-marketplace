"""S3 helpers for the pipeline worker."""
import os
import boto3

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION", "us-east-2"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

RAW_BUCKET = os.getenv("AWS_S3_BUCKET_RAW", "egocentric-raw-videos")
PROCESSED_BUCKET = os.getenv("AWS_S3_BUCKET_PROCESSED", "egocentric-processed-videos")

def download_clip(s3_key: str, local_path: str):
    s3.download_file(RAW_BUCKET, s3_key, local_path)

def upload_clip(local_path: str, s3_key: str):
    s3.upload_file(local_path, PROCESSED_BUCKET, s3_key)
