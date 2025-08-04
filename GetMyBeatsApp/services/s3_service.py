import os
import logging

import boto3
import botocore
from botocore.exceptions import ClientError

from django.conf import settings


logger = logging.getLogger(__name__)


class ModelNotConfiguredForS3DownloadException(Exception):
    pass


# TODO: `S3AudioService` to become a generic S3 wrapper (`S3Service`) with some audio-specifc methods
class S3AudioService:
    def __init__(self):
        session = boto3.session.Session()
        self.client = session.client(
            's3',
            endpoint_url=settings.S3_BUCKET_URL,
            config=botocore.config.Config(s3={'addressing_style': 'virtual'}),  # Configures to use subdomain/virtual calling format.
            region_name=settings.REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def upload(self, local_filepath: str, key: str):
        try:
            with open(local_filepath, 'rb') as f:
                self.client.upload_fileobj(f, Bucket=self.bucket_name, Key=key)
        except ClientError as e:
            print(f"Failed to upload {local_filepath}: {e.response['Error']['Message']}")

    def download(self, key: str, local_filepath: str):
        try:
            response = self.client.get_object(Bucket=self.bucket_name, Key=key)
            with open(local_filepath, 'wb') as f:
                for chunk in response['Body'].iter_chunks(chunk_size=8192):
                    f.write(chunk)
        except ClientError as e:
            print(f"Failed to download {key} from {self.bucket_name}: {e.response['Error']['Message']}")
    
    @staticmethod
    def get_assets_for_site_index():
        from GetMyBeatsApp.models import Audio, AudioArtwork
        extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
        logger.info('BEGIN get_assets_for_site_index', extra=extra)
        message = ''

        # note to self: this is tech debt that needs cleaning after a reliable virtualization mechanism is achieved
        for model in [Audio, AudioArtwork]:
            if model == Audio:
                key_prefix = 'audio'
            elif model == AudioArtwork:
                key_prefix = 'images'
            else:
                raise ModelNotConfiguredForS3DownloadException(f'model has not been properly configured: {model}')

            s3 = S3AudioService()
            for instance in model.objects.all():
                filepath = instance.file.path
                filename = f'{key_prefix}/{os.path.basename(filepath)}'

                if not os.path.exists(filepath):
                    create_filepath = f'{settings.MEDIA_ROOT}/{filename}'
                    try:
                        s3.download(filename, create_filepath)
                    except Exception as err:
                        message += f'couldnt get {filename}\n'
                        print(err)

            message = message or 'SUCCESS get_assets_for_site_index'
            extra[settings.LOGGER_EXTRA_DATA_KEY] = message
            print(message)

        logger.info('END get_assets_for_site_index', extra=extra)
