import os

from django.db import transaction
from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import Audio
from GetMyBeatsApp.helpers.db_utilities import get_new_hashed_audio_filename


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        updated_count = 0
        with transaction.atomic():
            audios = Audio.objects.all()
            for audio in audios:
                filename = os.path.basename(audio.file_upload.path)
                new_hashed_filename = get_new_hashed_audio_filename(filename)
                audio.filename_hash = new_hashed_filename
            updated_count = Audio.objects.bulk_update(audios, ['filename_hash'])
        print(f'audio hashes updated: {updated_count}')
