import pytest

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        retcode = pytest.main(['-x', 'GetMyBeatsApp/tests', '-vvv', '--reuse-db'])
        if retcode != 0:
            raise Exception('failed')
