import boto3
import os
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


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
    def get_audio_for_site_index():
        from GetMyBeatsApp.models import Audio
        extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
        logger.info('BEGIN get_audio_for_site_index', extra=extra)
        message = ''

        # note to self: this is tech debt that needs cleaning after a reliable virtualization mechanism is achieved
        s3 = S3AudioService()
        audio_instances = Audio.objects.all()

        for a in audio_instances:
            filepath = a.file_upload.path
            filename = os.path.basename(filepath)

            if not os.path.exists(filepath):
                create_filepath = f'{settings.MEDIA_ROOT}/{filename}'
                try:
                    s3.download(filename, create_filepath)
                except Exception as err:
                    message += f'couldnt get {filename}\n'
                    print(err)

        message = message or 'SUCCESS get_audio_for_site_index'
        extra[settings.LOGGER_EXTRA_DATA_KEY] = message
        logger.info('END get_audio_for_site_index', extra=extra)
        print(message)

        return audio_instances
