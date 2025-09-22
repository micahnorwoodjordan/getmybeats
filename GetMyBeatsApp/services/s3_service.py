import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import boto3
import botocore
from botocore.exceptions import ClientError
from botocore.config import Config

from django.conf import settings

from GetMyBeatsApp.models import LogEntry
from GetMyBeatsApp.services.log_service import LogService


MODULE = __name__


# TODO: optional arg to overwrite existing files


CONFIG = Config(
    retries={'max_attempts': 5},
    max_pool_connections=5,  # concurrent connections
    connect_timeout=10,
    read_timeout=60,
    s3={'addressing_style': 'path'}
)

VALID_S3_OBJECT_KEY_EXTENSIONS = (
    '.wav',
    '.mp3',
    '.png',
    '.jpg',
    '.jpeg'
)

DEFAULT_CHUNK_SIZE_BYTES = 8192


# TODO: `S3AudioService` to become a generic S3 wrapper (`S3Service`) with some audio-specifc methods
class S3AudioService:
    def __init__(self):
        session = boto3.session.Session()
        self.client = session.client(
            's3',
            endpoint_url=settings.S3_BUCKET_URL,
            config=CONFIG,
            region_name=settings.REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def ls(self):
        results = self.client.list_objects_v2(Bucket=self.bucket_name)
        print(results)

    def upload(self, key: str, local_filepath: str):
        try:
            with open(local_filepath, 'rb') as f:
                self.client.upload_fileobj(f, Bucket=self.bucket_name, Key=key)
                LogService.log(LogEntry.LogLevel.INFO, f'uploaded {key}', MODULE)
        except ClientError as e:
            LogService.log(LogEntry.LogLevel.ERROR, f'failed to upload {key}: {e.response["Error"]["Message"]}', MODULE)

    def download(self, key: str, local_filepath: str):
        try:
            response = self.client.get_object(Bucket=self.bucket_name, Key=key)
            with open(local_filepath, 'wb') as f:
                for chunk in response['Body'].iter_chunks(chunk_size=DEFAULT_CHUNK_SIZE_BYTES):
                    f.write(chunk)
            LogService.log(LogEntry.LogLevel.INFO, f'downloaded {key}', MODULE)

        except ClientError as e:
            LogService.log(LogEntry.LogLevel.ERROR, f'failed to download {key} from {self.bucket_name}: {e.response["Error"]["Message"]}', MODULE)

    def sync(self, prefix: str, local_dir: str):
        """sync the contents of a remote spaces object storage bucket to local filesystem"""
        download_tasks = []
        local_dir = Path(local_dir)
        paginator = self.client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)

        for page in pages:
            for obj in page.get('Contents', []):
                key = obj['Key']
                filename = os.path.basename(key)
                dest_path = os.path.join(settings.MEDIA_ROOT, filename)

                is_valid_target = any(ext in filename for ext in VALID_S3_OBJECT_KEY_EXTENSIONS)
                if not is_valid_target:
                    continue
                print(dest_path)
                download_tasks.append((key, dest_path))

        # Download in parallel using thread pool
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.download, *args) for args in download_tasks]
            for future in as_completed(futures):
                future.result()  # Re-raise exceptions if any

    @staticmethod
    def get_assets_for_site_index():
        try:
            s3 = S3AudioService()
            s3.sync('getmybeats/audio', settings.MEDIA_ROOT)
            s3.sync('getmybeats/images', settings.MEDIA_ROOT)
            LogService.log(LogEntry.LogLevel.INFO, 'get_assets_for_site_index SUCCESS', MODULE)
        except Exception as e:
            LogService.log(LogEntry.LogLevel.ERROR, f'get_assets_for_site_index ERROR: {e}', MODULE)
            raise
