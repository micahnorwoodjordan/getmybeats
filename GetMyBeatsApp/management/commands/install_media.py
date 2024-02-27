import logging
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.s3_service import S3Service
from GetMyBeatsApp.models import Audio


logger = logging.getLogger(__name__)


def get_artifact(service, audio_instance, media_type):
    extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
    logger.info('BEGIN get_artifact', extra=extra)

    if media_type == Audio.MediaType.audio:
        filepath = audio_instance.audio_file_upload.path
        filename = os.path.basename(filepath)
    elif media_type == Audio.MediaType.image:
        filepath = audio_instance.image_file_upload.path
        filename = os.path.basename(filepath)

    if os.path.exists(filepath):
        logger.info('END get_artifact: artifact already present', extra=extra)
        return

    message = ''
    create_filepath = f'{settings.MEDIA_ROOT}/{filename}'
    try:
        service.download(filename, create_filepath)
        logger.info(f'SUCCESS get_artifact: {filename}', extra=extra)
    except Exception as err:
        message += f'couldnt get {filename}\n'
        print(err)
        extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(err)
        logger.error('ERROR get_media', extra=extra)


def get_artifacts():
    """download all Audio s3 artifacts"""
    # note to self: this is tech debt that needs cleaning after a reliable virtualization mechanism is achieved

    audio_instances = Audio.objects.all()
    for audio in audio_instances:
        s3 = S3Service(settings.S3_AUDIO_BUCKET)
        get_artifact(s3, audio, Audio.MediaType.audio)
        s3 = S3Service(settings.S3_IMAGE_BUCKET)
        get_artifact(s3, audio, Audio.MediaType.image)
    return audio_instances


class Command(BaseCommand):
    help = 'download site artifacts from S3 if they are not already on disk.'

    def handle(self, *args, **options):
        try:
            get_artifacts()
        except Exception as e:
            print(e)
