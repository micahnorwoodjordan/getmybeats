import os

from django.db import transaction
from django.utils.timezone import now
from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import Audio
from GetMyBeatsApp.helpers.db_utilities import get_new_hashed_audio_filename


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        now_utc = now()
        updated_count = 0
        with transaction.atomic():
            audios = Audio.objects.all()
            for audio in audios:
                filename = os.path.basename(audio.file.path)
                new_hashed_filename = get_new_hashed_audio_filename(filename)
                audio.filename_hash = new_hashed_filename
                audio.filename_hash_updated_at = now_utc
            updated_count = Audio.objects.bulk_update(audios, ['filename_hash', 'filename_hash_updated_at'])
        print(f'audio hashes updated: {updated_count}')
