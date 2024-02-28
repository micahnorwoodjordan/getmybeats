import os
import logging
from enum import Enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.conf import settings
from django.core.cache import cache

from GetMyBeatsApp.services.s3_service import S3Service
from GetMyBeatsApp.templatetags.string_formatters import UNDERSCORE, space_to_charx

logger = logging.getLogger(__name__)


class User(AbstractUser):
    email = models.CharField(max_length=100, blank=False, null=False, unique=True)
    username = models.CharField(blank=False, max_length=50, null=False, unique=True)

    class Meta:
        db_table = 'auth_user'
        unique_together = ('username', 'email')
        managed = True

    def __str__(self):
        return f'{User.__name__}: {self.id} -> {self.first_name} {self.last_name}'


class Audio(models.Model):
    """
    Title and file path naming specification:

    Titles may contain space characters.
    File names (/foo/bar/file_name.mp3) will be underscore-delimited.
    """
    class Status(Enum):
        concept = 1
        in_progress = 2
        needs_fine_tuning = 3
        finished = 4

    class MediaType(Enum):
        audio = 1
        image = 2

    def populate_s3_upload_path(media_type):
        """convience method for to populate the s3 fields in the django admin interface"""
        prefix = 's3://'
        placeholder_filename = 'XXXXXX'
        if media_type == 1:  # Audio.MediaType.audio
            bucket = settings.S3_AUDIO_BUCKET
        elif media_type == 2:  # Audio.MediaType.image
            bucket = settings.S3_IMAGE_BUCKET
        return os.path.join(prefix, bucket, placeholder_filename)

    id = models.AutoField(primary_key=True)
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False, default=1)  # super user
    uploaded_at = models.DateTimeField(default=now)
    title = models.CharField(max_length=200, blank=False, null=False, unique=True)
    length = models.CharField(max_length=50, blank=True, null=True)  # TODO: javascript to do some math
    audio_file_upload = models.FileField()
    image_file_upload = models.FileField()
    status = models.SmallIntegerField()
    s3_audio_upload_path = models.CharField(
        max_length=200, blank=False, null=False, unique=True, default=populate_s3_upload_path(MediaType.audio.value)
    )
    s3_artwork_upload_path = models.CharField(
        max_length=200, blank=False, null=False, unique=True, default=populate_s3_upload_path(MediaType.image.value)
    )

    def delete(self, *args, **kwargs):
        # NOTE: this is an Audio instance method, meaning that bulk deletes on QuerySets won't invalidate the cache
        cache.clear()
        super(Audio, self).delete()

    def save(self, *args, **kwargs):  # TODO remove this tech debt
        """override django's native save() method to automatically upload audio files to S3. NOTE: this implementation
           is tech debt:
                * calling `save` on model instances hits the database twice
                * calling `save` on model instances automatically makes 2 S3 calls
        look into NamedTemporaryFiles; inefficient, but file doesn't get written on disk until committed to db"""

        super().save(*args, **kwargs)

        extra = {settings.LOGGER_EXTRA_DATA_KEY: None}

        try:
            # audio file upload
            audio_filepath = space_to_charx(self.audio_file_upload.path, UNDERSCORE)
            s3 = S3Service(settings.S3_AUDIO_BUCKET)
            s3.upload(audio_filepath, self.title + os.path.splitext(audio_filepath)[1])
            # image file upload
            image_filepath = space_to_charx(self.image_file_upload.path, UNDERSCORE)
            s3 = S3Service(settings.S3_IMAGE_BUCKET)
            s3.upload(image_filepath, self.title + os.path.splitext(image_filepath)[1])
        except Exception as e:
            extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(e)
            logger.exception('EXCEPTION saving Audio instance', extra=extra)

        cache.clear()
        return super().save(*args, **kwargs)

    class Meta:
        db_table = 'audio'
        managed = True

    def __str__(self):
        return f'{Audio.__name__}: {self.id} -> {self.title} uploaded by {self.fk_uploaded_by.username}'
