import boto3
import os
import logging

from django.conf import settings


logger = logging.getLogger(__name__)


class ModelNotConfiguredForS3DownloadException(Exception):
    pass


# TODO: `S3AudioService` to become a generic S3 wrapper (`S3Service`) with some audio-specifc methods
class S3AudioService:
    def __init__(self, bucket=None):
        self.resource = boto3.resource('s3')
        self.bucket = self.resource.Bucket(bucket or settings.S3_AUDIO_BUCKET)

    def upload(self, local_filepath, remote_filepath):
        self.bucket.upload_file(local_filepath, remote_filepath)

    def download(self, remote_filepath, local_filepath):
        s3_object = self.resource.Object(self.bucket._name, remote_filepath)
        s3_object.download_file(local_filepath)
    
    @staticmethod
    def get_assets_for_site_index():
        from GetMyBeatsApp.models import Audio, AudioArtwork
        extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
        logger.info('BEGIN get_assets_for_site_index', extra=extra)
        message = ''

        # note to self: this is tech debt that needs cleaning after a reliable virtualization mechanism is achieved
        for model in [Audio, AudioArtwork]:
            if model == Audio:
                s3 = S3AudioService(bucket=settings.S3_AUDIO_BUCKET)
            elif model == AudioArtwork:
                s3 = S3AudioService(bucket=settings.S3_ARTWORK_BUCKET)
            else:
                raise ModelNotConfiguredForS3DownloadException(f'model has not been properly configured: {model}')

            for instance in model.objects.all():
                filepath = instance.file.path
                filename = os.path.basename(filepath)

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
