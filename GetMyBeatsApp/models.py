import os
import logging
from enum import Enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.conf import settings
from django.core.cache import cache

from GetMyBeatsApp.services.s3_service import S3AudioService
from GetMyBeatsApp.templatetags.string_formatters import space_to_charx, UNDERSCORE
from GetMyBeatsApp.helpers.db_utilities import get_new_hashed_audio_filename, get_file_upload_path_pre_save


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
    id = models.AutoField(primary_key=True)
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False, default=1)  # super user
    updated_at = models.DateTimeField(default=now)
    title = models.CharField(max_length=200, blank=True, null=False, unique=True)
    file_upload = models.FileField(upload_to=get_file_upload_path_pre_save)  # specifying `upload_to` will nest the filepath argument. this is not wanted.
    filename_hash = models.CharField(max_length=300, null=True, blank=True)  # TODO: flip blank/null and re-migrate
    filename_hash_updated_at = models.DateTimeField(null=True, blank=True)  # TODO: flip blank/null and re-migrate
    #   the two fields above temporarily allow null to avoid having to manually provide values for older audio objects
    #   flip and re-migrate after all existing audio objects have this field populated
    s3_upload_path = models.CharField(max_length=300, null=True, blank=True, unique=True)

    def delete(self, *args, **kwargs):
        cache.clear()
        super(Audio, self).delete()

    def save(self, *args, **kwargs):
        upload = self.file_upload
        filename = space_to_charx(upload.name, UNDERSCORE).lower()
        self.title = filename.split('.')[0]

        if self.filename_hash is None:
            self.filename_hash_updated_at = now()
            self.filename_hash = get_new_hashed_audio_filename(os.path.basename(upload.path))

        if not self.s3_upload_path:
            with open(filename, 'wb') as file:
                file.write(upload.read())
            try:
                s3 = S3AudioService()
                s3.upload(filename, filename)
                self.s3_upload_path = f's3://{settings.S3_AUDIO_BUCKET}/{filename}'
                print(f's3 upload success: {self.s3_upload_path}')
            except Exception as e:
                logger.exception('EXCEPTION saving Audio instance', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
                raise
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


class RenewedSSLConfiguration(models.Model):
    s3_path = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'renewed_ssl_configuration'


class SiteVisitRequest(models.Model):
    ip = models.CharField(max_length=15)
    params = models.CharField(max_length=100)
    headers = models.JSONField()
    body = models.JSONField()
    user_agent = models.CharField(max_length=200)
    method = models.CharField(max_length=10)

    class Meta:
        managed = True
        db_table = 'site_visit_request'
