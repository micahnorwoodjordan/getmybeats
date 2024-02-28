import logging
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.s3_service import S3Service
from GetMyBeatsApp.models import Audio


logger = logging.getLogger(__name__)


def get_artifact(service, audio_instance, media_type, force_overwrite=False):
    extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
    logger.info('BEGIN get_artifact', extra=extra)

    if media_type == Audio.MediaType.audio:
        filepath = audio_instance.audio_file_upload.path
        filename = os.path.basename(filepath)
    elif media_type == Audio.MediaType.image:
        filepath = audio_instance.image_file_upload.path
        filename = os.path.basename(filepath)

    if force_overwrite:
        create_filepath = os.path.join(settings.MEDIA_ROOT, filename)
        try:
            service.download(filename, create_filepath)
            logger.info(f'SUCCESS get_artifact: {filename}', extra=extra)
        except Exception as err:
            print(f'couldnt get {filename}\n')
            extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(err)
            logger.error(f'ERROR get_artifact: {filename}', extra=extra)
    else:
        if os.path.exists(filepath):
            logger.info('END get_artifact: artifact already present', extra=extra)


def get_artifacts(force_overwrite=False):
    """download all Audio s3 artifacts"""

    audio_instances = Audio.objects.all()
    for audio in audio_instances:
        s3 = S3Service(settings.S3_AUDIO_BUCKET)
        get_artifact(s3, audio, Audio.MediaType.audio, force_overwrite=force_overwrite)
        s3 = S3Service(settings.S3_IMAGE_BUCKET)
        get_artifact(s3, audio, Audio.MediaType.image, force_overwrite=force_overwrite)


def put_artifact(service, audio_instance, media_type, force_overwrite=False):
    extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
    logger.info('BEGIN put_artifact', extra=extra)

    if media_type == Audio.MediaType.audio:
        filepath = audio_instance.audio_file_upload.path
        key = os.path.basename(audio_instance.s3_audio_upload_path)
    elif media_type == Audio.MediaType.image:
        filepath = audio_instance.image_file_upload.path
        key = os.path.basename(audio_instance.s3_artwork_upload_path)

    if force_overwrite:
        try:
            service.upload(filepath, key)
            logger.info(f'SUCCESS put_artifact: {key}', extra=extra)
        except Exception as err:
            print(f'couldnt put {key}\n')
            extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(err)
            logger.error(f'ERROR put_artifact: {key}', extra=extra)
    else:
        existing_keys = [obj.key for obj in service.bucket.objects.all()]
        if key in existing_keys:
            logger.info('END put_artifact: artifact already present', extra=extra)


def put_artifacts(force_overwrite=False):
    """upload all Audio s3 artifacts"""

    audio_instances = Audio.objects.all()
    for audio in audio_instances:
        s3 = S3Service(settings.S3_AUDIO_BUCKET)
        put_artifact(s3, audio, Audio.MediaType.audio, force_overwrite=force_overwrite)
        s3 = S3Service(settings.S3_IMAGE_BUCKET)
        put_artifact(s3, audio, Audio.MediaType.image, force_overwrite=force_overwrite)


class Command(BaseCommand):
    help = 'download site artifacts from S3 if they are not already on disk.'

    def add_arguments(self, parser):
        parser.add_argument("directive", choices=['download', 'upload'], type=str)
        parser.add_argument("--force", action='store_true', help='force file/object overwrites due to exact namespacing')

    def handle(self, *args, **options):
        """
        upload to S3, overwriting any and all objects whose keys match local filenames:
            python3 manage.py manage_media --upload --force

        download from S3, overwriting any and all local files whose names match bucket keys:
            python3 manage.py manage_media --download --force

        upload to S3, WITHOUT overwriting any objects whose keys match local filenames:
            python3 manage.py manage_media --upload
        """
        try:
            directive = options['directive']
            force_overwrite = options.get('force')

            # TODO: unit test
            if directive == 'download':
                get_artifacts(force_overwrite=force_overwrite)
            elif directive == 'upload':
                put_artifacts(force_overwrite=force_overwrite)
        except Exception as e:
            print(e)
