import os

from django.db import models
from django.db import transaction
from django.utils.timezone import now
from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import Audio, AudioArtwork
from GetMyBeatsApp.helpers.db_utilities import get_new_hashed_filename


def rotate(model: models.Model) -> int:
    """
    helper method to update filename hashes. this method assumes that the model being passed in has both a
    `filename_hash` and `filename_hash_updated_at` field.
    """
    now_utc = now()
    updated_count = 0
    with transaction.atomic():
        objects = model.objects.all()
        for obj in objects:
            filename = os.path.basename(obj.file.path)
            new_hashed_filename = get_new_hashed_filename(filename)
            obj.filename_hash = new_hashed_filename
            obj.filename_hash_updated_at = now_utc
        updated_count = model.objects.bulk_update(objects, ['filename_hash', 'filename_hash_updated_at'])
    return updated_count


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        audios_updated = rotate(Audio)
        artworks_updated = rotate(AudioArtwork)
        print(f'hash rotation summary:\n\tAudio objects updated {audios_updated}\n\tAudioArtwork objects updated {artworks_updated}\n')
