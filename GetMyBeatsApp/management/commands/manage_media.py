import logging
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.s3_service import S3Service
from GetMyBeatsApp.models import Audio


logger = logging.getLogger(__name__)


def get_artifact(service, audio_instance, media_type, existing_artifacts=None, overwrite=False):
    extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
    logger.info('BEGIN force get_artifact' if overwrite else 'BEGIN get_artifact', extra=extra)

    if existing_artifacts is None:
        existing_artifacts = []

    if media_type == Audio.MediaType.audio:
        filepath = audio_instance.audio_file_upload.path
        filename = os.path.basename(filepath)
    elif media_type == Audio.MediaType.image:
        filepath = audio_instance.image_file_upload.path
        filename = os.path.basename(filepath)

    create_filepath = os.path.join(settings.MEDIA_ROOT, filename)
    try:
        if overwrite:
            service.download(filename, create_filepath)
            logger.info(f'SUCCESS force get_artifact: {filename}', extra=extra)
        else:
            if filename in existing_artifacts:
                logger.info(f'END get_artifact: artifact already present: {filename}', extra=extra)
            else:
                service.download(filename, create_filepath)
                logger.info(f'SUCCESS get_artifact: {filename}', extra=extra)

    except Exception as err:
        print(f'couldnt get {filename}\n')
        extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(err)
        logger.error(f'ERROR get_artifact: {filename}', extra=extra)


def get_artifacts(overwrite=False):
    """download all Audio s3 artifacts"""

    s3_audio_service = S3Service(settings.S3_AUDIO_BUCKET)
    s3_image_service = S3Service(settings.S3_IMAGE_BUCKET)
    existing_artifacts = os.listdir(settings.MEDIA_ROOT)
    audio_instances = Audio.objects.all()
    for audio in audio_instances:
        get_artifact(s3_audio_service, audio, Audio.MediaType.audio, existing_artifacts=existing_artifacts, overwrite=overwrite)
        get_artifact(s3_image_service, audio, Audio.MediaType.image, existing_artifacts=existing_artifacts, overwrite=overwrite)


def put_artifact(service, audio_instance, media_type, existing_artifacts=None, overwrite=False):
    extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
    logger.info('BEGIN force put_artifact' if overwrite else 'BEGIN put_artifact', extra=extra)

    if existing_artifacts is None:
        existing_artifacts = []

    if media_type == Audio.MediaType.audio:
        filepath = audio_instance.audio_file_upload.path
        key = os.path.basename(audio_instance.s3_audio_upload_path)
    elif media_type == Audio.MediaType.image:
        filepath = audio_instance.image_file_upload.path
        key = os.path.basename(audio_instance.s3_artwork_upload_path)

    try:
        if overwrite:
            service.upload(filepath, key)
            logger.info(f'SUCCESS force put_artifact: {key}', extra=extra)
        else:
            if key in existing_artifacts:
                logger.info(f'END put_artifact: artifact already present: {key}', extra=extra)
            else:
                service.upload(filepath, key)
                logger.info(f'SUCCESS put_artifact: {key}', extra=extra)
    except Exception as err:
        print(f'couldnt put {key}\n')
        extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(err)
        logger.error(f'ERROR put_artifact: {key}', extra=extra)


def put_artifacts(overwrite=False):
    """upload all Audio s3 artifacts"""

    s3_audio_service = S3Service(settings.S3_AUDIO_BUCKET)
    existing_audio_artifacts = [obj.key for obj in s3_audio_service.bucket.objects.all()]
    s3_image_service = S3Service(settings.S3_IMAGE_BUCKET)
    existing_image_artifacts = [obj.key for obj in s3_image_service.bucket.objects.all()]

    audio_instances = Audio.objects.all()
    for audio in audio_instances:
        put_artifact(s3_audio_service, audio, Audio.MediaType.audio, existing_artifacts=existing_audio_artifacts, overwrite=overwrite)
        put_artifact(s3_image_service, audio, Audio.MediaType.image, existing_artifacts=existing_image_artifacts, overwrite=overwrite)


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
            overwrite = options.get('force')

            # TODO: unit test
            if directive == 'download':
                get_artifacts(overwrite=overwrite)
            elif directive == 'upload':
                put_artifacts(overwrite=overwrite)
        except Exception as e:
            print(e)
