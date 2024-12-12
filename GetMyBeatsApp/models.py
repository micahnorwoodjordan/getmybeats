import os
import logging
import tempfile
from enum import Enum

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

from GetMyBeatsApp.services.s3_service import S3AudioService
from GetMyBeatsApp.helpers.db_utilities import get_new_hashed_audio_filename
from GetMyBeatsApp.templatetags.string_formatters import space_to_charx, UNDERSCORE


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


class AudioArtwork(models.Model):
    id = models.AutoField(primary_key=True)
    width = models.DecimalField(max_digits=6, decimal_places=2)
    height = models.DecimalField(max_digits=6, decimal_places=2)
    file = models.FileField()
    filename_hash = models.CharField(max_length=300, null=True, blank=True)
    creation_timestamp = models.DateTimeField(auto_now=True)
    s3_upload_path = models.CharField(max_length=300, null=True, blank=True, unique=True)
    ext = models.CharField(max_length=20, blank=True, null=False)

    @property
    def _attributes(self):
        return {
            'file': self.file,
            'filename_hash': self.filename_hash,
            's3_upload_path': self.s3_upload_path,
            'ext': self.ext
        }

    def save(self, *args, **kwargs):
        if self.id:
            previous_file = AudioArtwork.objects.get(pk=self.id)._attributes['file']
            if previous_file != self.file:
                self.upload_to_s3_on_save()
        else:
            fp = self.file.path
            self.ext = '.' + fp.split('.')[-1]
            self.filename_hash = get_new_hashed_audio_filename(os.path.basename(fp))
            super().save(*args, **kwargs)  # commit file to disk for s3 upload
            self.upload_to_s3_on_save()
        return super().save(*args, **kwargs)

    def upload_to_s3_on_save(self):  # TODO: refactor to reduce copypasta
        filename = os.path.basename(self.file.path)
        try:
            S3AudioService(bucket=settings.S3_ARTWORK_BUCKET).upload(self.file.path, filename)
            self.s3_upload_path = f's3://{settings.S3_ARTWORK_BUCKET}/{filename}'
            logger.info('upload_to_s3_on_save success', extra={settings.LOGGER_EXTRA_DATA_KEY: filename})
            return True
        except Exception as err:
            logger.exception('upload_to_s3_on_save failure', extra={settings.LOGGER_EXTRA_DATA_KEY: str(err)})
            return False

    class Meta:
        db_table = 'audio_artwork'
        managed = True


class Audio(models.Model):
    id = models.AutoField(primary_key=True)
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False, default=1)  # super user
    updated_at = models.DateTimeField(default=now)
    title = models.CharField(max_length=200, blank=True, null=False, unique=True)
    file = models.FileField()
    filename_hash = models.CharField(max_length=300, null=True, blank=True)  # TODO: flip blank/null and re-migrate
    filename_hash_updated_at = models.DateTimeField(null=True, blank=True)  # TODO: flip blank/null and re-migrate
    #   the two fields above temporarily allow null to avoid having to manually provide values for older audio objects
    #   flip and re-migrate after all existing audio objects have this field populated
    s3_upload_path = models.CharField(max_length=300, null=True, blank=True, unique=True)
    ext = models.CharField(max_length=20, blank=True, null=False)
    artwork = models.ForeignKey(AudioArtwork, on_delete=models.DO_NOTHING, null=True, blank=True)

    def save(self, *args, **kwargs):
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in self.file.chunks():
                temp_file.write(chunk)

            filename = space_to_charx(self.file.name, UNDERSCORE).lower()
            fp = self.file.path
            self.ext = '.' + fp.split('.')[-1]
            self.title = filename.replace(self.ext, '')
            self.filename_hash_updated_at = now()
            self.filename_hash = get_new_hashed_audio_filename(os.path.basename(fp))
            S3AudioService().upload(temp_file.name, filename)
            self.s3_upload_path = f's3://{settings.S3_AUDIO_BUCKET}/{filename}'
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


class UserExperienceReport(models.Model):
    """
    these fields all refer to features, i.e. "feature issues", "recent features", "upcoming features".
    by simply creating a new db entry, users will stay up-to-date on the currently-known overall website functionality
    """
    issues = models.JSONField()
    upcoming = models.JSONField()
    recent = models.JSONField()


class AudioFetchRequest(models.Model):
    request_uuid = models.UUIDField(primary_key=False, blank=False, null=False)

    class Meta:
        managed = True
        db_table = 'audio_fetch_request'
