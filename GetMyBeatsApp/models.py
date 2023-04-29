import os
from enum import Enum

from django.db import models
from django.db import IntegrityError, connection, models, transaction
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils.timezone import now

from .db.utilities import b64encode_file_upload
from GetMyBeatsApp.services.s3_service import S3AudioService


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
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False, default=User.objects.get(id=1).id)
    uploaded_at = models.DateTimeField(default=now)
    title = models.CharField(max_length=200, blank=False, null=False, unique=True)
    length = models.CharField(max_length=50, blank=True, null=True)  # TODO: look into django types that might be better to store audio duration data
    raw_bytes = models.BinaryField(max_length=1000)  # for big files, some clients will crash trying to retrieve this
    file_upload = models.FileField()  # specifying `upload_to` will nest the filepath argument. this is not wanted.
    status = models.SmallIntegerField()

    def save(self, upload=False, *args, **kwargs):
        # override django's natve save() method
        # inefficient, but file doesn't get written until committed to db
        # TODO: look into NamedTemporaryFiles
        _saved_instance_data = super().save(*args, **kwargs)
        if not upload:
            return _saved_instance_data

        super().save(*args, **kwargs)
        filepath = self.file_upload.path
        filename = os.path.basename(filepath).replace(' ', '_')
        s3 = S3AudioService()
        s3.upload(filepath, filename)
        return super().save(*args, **kwargs)

    class Status(Enum):
        concept = 1
        in_progress = 2
        needs_fine_tuning = 3
        finshed = 4


    class Meta:
        db_table = 'audio'
        managed = True

    def __str__(self):
        return f'{Audio.__name__}: {self.id} -> {self.title} uploaded by {self.fk_uploaded_by.username}'
