import os
import logging
from enum import Enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.conf import settings
from django.core.cache import cache

from GetMyBeatsApp.templatetags.string_formatters import UNDERSCORE


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
    Model representing a song, most importantly encapsulating its local filepath, artwork, and corresponding S3 URI's.

    The general spec is that all file names and paths will be underscore-delimited.
        examples:
            /foo/bar/file_name.mp3  --> file_name.mp3
            /foo/bar/File_Name.mp3  --> file_name.mp3
            /foo/bar/File Name.mp3  --> file_name.mp3
            /foo/bar/file name.mp3  --> file_name.mp3
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

    def get_sanitized_title(string):  # MY NOODLES --> my_noodles
        # TODO: unit test
        A = 65
        a = 97
        Z = 90
        z = 122
        underscore = 95
        new_title = ''
        for character in string:
            is_lowercase = ord(character) >= a and ord(character) <= z
            is_uppercase = ord(character) >= A and ord(character) <= Z
            is_letter = is_lowercase or is_uppercase
            is_underscore = ord(character) == underscore
            is_space = character == ' '

            if is_letter:
                new_title += character.lower()
                continue
            if is_space:
                new_title += UNDERSCORE
                continue
            if is_underscore:
                new_title += character
        return new_title

    def validate_s3_path(path):
        # TODO: unit test
        msg = f'invalid s3 path: {path}'

        protocol = 's3://'
        if protocol not in path:
            raise Exception(msg)

        ext = os.path.splitext(path)[1]
        if ext == '':
            raise Exception(msg)

        basename = os.path.basename(path)
        bucket = path.replace(protocol, '').replace(basename, '')
        if bucket == '':
            raise Exception(msg)

    def get_sanitized_s3_path(path):  # s3://getmybeats-audio-dev/NOODLES.wav --> s3://getmybeats-audio-dev/noodles.wav
        # TODO: unit test
        A = 65
        a = 97
        Z = 90
        z = 122
        underscore = 95

        protocol = 's3://'
        basename = os.path.basename(path)
        ext = os.path.splitext(path)[1]
        bucket = path.replace(protocol, '').replace(basename, '')
        sanitized = protocol + bucket

        for character in basename:
            is_lowercase = ord(character) >= a and ord(character) <= z
            is_uppercase = ord(character) >= A and ord(character) <= Z
            is_letter = is_lowercase or is_uppercase
            is_underscore = ord(character) == underscore
            is_space = character == ' '

            if is_letter:
                sanitized += character.lower()
                continue
            if is_space:
                sanitized += UNDERSCORE
                continue
            if character in ext:
                sanitized += character
                continue
            if is_underscore:
                sanitized += character
        return sanitized

    def delete(self, *args, **kwargs):
        # NOTE: this is an Audio instance method, meaning that bulk deletes on QuerySets won't invalidate the cache
        cache.clear()
        super(Audio, self).delete()

    def save(self, *args, **kwargs):
        if 'XXXXXX' in self.s3_audio_upload_path:
            raise Exception(f'invalid S3 path: {self.s3_audio_upload_path}')
        if 'XXXXXX' in self.s3_artwork_upload_path:
            raise Exception(f'invalid S3 path: {self.s3_artwork_upload_path}')

        Audio.validate_s3_path(self.s3_audio_upload_path)
        Audio.validate_s3_path(self.s3_artwork_upload_path)
        self.title = Audio.get_sanitized_title(self.title)
        self.s3_audio_upload_path = Audio.get_sanitized_s3_path(self.s3_audio_upload_path)
        self.s3_artwork_upload_path = Audio.get_sanitized_s3_path(self.s3_artwork_upload_path)
        cache.clear()
        return super().save(*args, **kwargs)

    class Meta:
        db_table = 'audio'
        managed = True

    def __str__(self):
        return f'{Audio.__name__}: {self.id} -> {self.title} uploaded by {self.fk_uploaded_by.username}'
