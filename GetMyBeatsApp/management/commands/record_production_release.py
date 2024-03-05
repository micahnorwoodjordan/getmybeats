import os

from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import ProductionRelease
from GetMyBeatsApp.services.digital_ocean_service import DigitalOceanService


class Command(BaseCommand):
    help = 'record data about the current production release'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        env = dict()
        wanted = ['CODE_BRANCH', 'RELEASE']  # only these params are prone to change. all other are basically the same
        for k, v in os.environ.items():
            if k in wanted:
                env[k] = v

        hostname = DigitalOceanService()._get_droplet_hostname()
        env['HOSTNAME'] = hostname  # not truly an env var, but it IS persistent for the lifetime of the app instance

        ProductionRelease.objects.create(environment=env)
