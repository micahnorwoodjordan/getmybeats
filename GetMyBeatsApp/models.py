import os
import logging
from enum import Enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.conf import settings
from django.core.cache import cache

from GetMyBeatsApp.services.s3_service import S3AudioService
from GetMyBeatsApp.templatetags.string_formatters import UNDERSCORE, space_to_charx


logger = logging.getLogger(__name__)


class ProductionRelease(models.Model):
    release_date = models.DateTimeField(auto_now=True)
    environment = models.JSONField()

    class Meta:
        managed = True
        db_table = 'production_release'


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
    File names (/foo/bar/file_name.mp3) will be underscore delimited.
    """
    id = models.AutoField(primary_key=True)
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False, default=1)  # super user
    uploaded_at = models.DateTimeField(default=now)
    title = models.CharField(max_length=200, blank=False, null=False, unique=True)
    length = models.CharField(max_length=50, blank=True, null=True)  # TODO: look into django types that might be better to store audio duration data
    file_upload = models.FileField()  # specifying `upload_to` will nest the filepath argument. this is not wanted.
    status = models.SmallIntegerField()

    def delete(self, *args, **kwargs):
        # NOTE: this is an Audio instance method, meaning that it can't be called on QuerySets
        cache.clear()
        super(Audio, self).delete()

    def save(self, *args, **kwargs):
        """
        override django's native save() method to automatically upload audio files to S3
        """
        # TODO: look into NamedTemporaryFiles; inefficient, but file doesn't get written on disk until committed to db
        super().save(*args, **kwargs)

        extra = {settings.LOGGER_EXTRA_DATA_KEY: None}
        filepath = self.get_sanitized_path_for_s3()
        s3 = S3AudioService()

        try:
            s3.upload(filepath, os.path.basename(filepath))
        except Exception as e:
            extra[settings.LOGGER_EXTRA_DATA_KEY] = repr(e)
            logger.exception('EXCEPTION saving Audio instance', extra=extra)
            return
        cache.clear()
        return super().save(*args, **kwargs)

    class Status(Enum):
        concept = 1
        in_progress = 2
        needs_fine_tuning = 3
        finished = 4

    class Meta:
        db_table = 'audio'
        managed = True

    def __str__(self):
        return f'{Audio.__name__}: {self.id} -> {self.title} uploaded by {self.fk_uploaded_by.username}'

    def get_sanitized_path_for_s3(self):
        return space_to_charx(self.file_upload.path, UNDERSCORE)
