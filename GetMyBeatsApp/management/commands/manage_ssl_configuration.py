import os
import enum

from django.conf import settings
from django.core.management.base import BaseCommand

from GetMyBeatsApp.models import RenewedSSLConfiguration
from GetMyBeatsApp.services.s3_service import S3AudioService


def record_new_ssl_configuration(s3_path):
    if s3_path is None:
        raise Exception('s3 path is null')
    RenewedSSLConfiguration.objects.create(s3_path=s3_path)


def install_current_ssl_configuration():
    current = RenewedSSLConfiguration.objects.last()
    current_ssl_config_filename = os.path.basename(current.s3_path)
    download_filepath = f'{settings.BASE_DIR}/{current_ssl_config_filename}'
    s3 = S3AudioService(bucket='ssl-certificate-files')
    s3.download(current_ssl_config_filename, download_filepath)
    print(current_ssl_config_filename)  # for provisioning script to read output


class Action(enum.Enum):
    record_new = 1
    install_current = 2


class Command(BaseCommand):
    help = """when the site\'s SSL certificate needs to be renewed, this command points the application at the updated tar.
    this command records the new file name to point fresh instances at the renewed certificate"""

    def add_arguments(self, parser):
        parser.add_argument('action', choices=[a.name for a in Action], type=str)
        parser.add_argument('--s3-path', type=str)

    def handle(self, *args, **options):
        action = options['action']

        if action == Action.record_new.name:
            record_new_ssl_configuration(options['s3_path'])
        elif action == Action.install_current.name:
            install_current_ssl_configuration()
