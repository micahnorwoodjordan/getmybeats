from django.core.management.base import BaseCommand

from GetMyBeatsApp.services.s3_service import S3AudioService


class Command(BaseCommand):
    help = 'download audio files from S3 if they are not already on disk.'

    def handle(self, *args, **options):
        S3AudioService.get_audio_for_site_index()
