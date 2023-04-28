import boto3
import os

from django.conf import settings


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

        # note to self: the existence of this method maybe indicates a bad design
        s3 = S3AudioService()
        audio_instances = Audio.objects.all()

        for a in audio_instances:
            filepath = a.file_upload.path
            filename = os.path.basename(filepath)

            if not os.path.exists(filepath):
                new_filepath = f'{settings.MEDIA_ROOT}{filename}'
                try:
                    s3.download(filename, new_filepath)
                except:
                    print(f'error retrieving {filename}')

        return audio_instances
