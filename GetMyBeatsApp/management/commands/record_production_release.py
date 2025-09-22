import os

from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import ProductionRelease, LogEntry
from GetMyBeatsApp.services.log_service import LogService


MODULE = __name__


class Command(BaseCommand):
    help = 'record data about the current production release'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        try:
            ProductionRelease.objects.create(environment={k: v for k, v in os.environ.items()})
        except Exception as e:
            LogService.log(LogEntry.LogLevel.ERROR, f'error recording production release: {e}', MODULE)
