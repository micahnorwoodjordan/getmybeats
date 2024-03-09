from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.digital_ocean_service import DigitalOceanService


class Command(BaseCommand):
    help = """add the calling app instance to the VPC firewall while also removing the oldest instance.
    passing the '--preserve-existing' flag will preserve the older instance.
    NOTE: application instances are behind a dedicated firewall,
    so there is no possibility of accidentally removing other server types from the firewall.
    """

    def add_arguments(self, parser):
        parser.add_argument("--preserve-existing", action='store_true',
                            help='flag to preserve the other existing app instance in the firewall refresh process')

    def handle(self, *args, **options):
        service = DigitalOceanService(settings.DIGITALOCEAN_API_HOST, settings.DIGITALOCEAN_BEARER_TOKEN)
        post_was_successful = service.add_self_to_firewall()
        print(post_was_successful)

        delete_was_successful = None
        preserve_existing_nodes = options.get('preserve_existing')
        if not preserve_existing_nodes:
            droplets_details = service.get_droplets_details()
            firewall_details = service.get_firewall_details()['firewall']
            firewall_droplet_ids = firewall_details['droplet_ids']
            oldest_node_behind_firewall = DigitalOceanService.sort_droplet_ids_by_oldest(droplets_details, firewall_droplet_ids)[0]
            if oldest_node_behind_firewall in firewall_droplet_ids:
                delete_was_successful = service.remove_node_from_firewall(oldest_node_behind_firewall)
            else:
                print(f'node {oldest_node_behind_firewall} was marked as the oldest but did not exist in firewall')
        print(delete_was_successful)
