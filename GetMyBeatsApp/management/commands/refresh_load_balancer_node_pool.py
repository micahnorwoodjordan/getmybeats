from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.digital_ocean_service import DigitalOceanService


class UnexpectedNodePoolSizeException(Exception):
    pass


class Command(BaseCommand):
    help = """add the calling app instance to the load balancer node pool while also removing the older instance.
    passing the '--preserve-existing' flag will preserve the older instance
    """

    def add_arguments(self, parser):
        parser.add_argument("--preserve-existing", action='store_true',
                            help='flag to preserve the other existing app instance in the scaling process')

    def handle(self, *args, **options):
        preserve_existing_nodes = options.get('preserve_existing')
        service = DigitalOceanService(settings.DIGITALOCEAN_API_HOST, settings.DIGITALOCEAN_BEARER_TOKEN)
        droplets_details = service.get_droplets_details()
        load_balancer_details = service.get_load_balancer_details()['load_balancer']
        load_balancer_droplet_ids = load_balancer_details['droplet_ids']
        oldest_node_in_pool = DigitalOceanService.sort_droplet_ids_by_oldest(droplets_details, load_balancer_droplet_ids)[0]

        upscale_was_successful = service.upscale_load_balancer()
        print(upscale_was_successful)
        if not preserve_existing_nodes:
            if oldest_node_in_pool in load_balancer_droplet_ids:
                service.downscale_load_balancer(oldest_node_in_pool)
            else:
                print(f'node {oldest_node_in_pool} was marked as the oldest but did not exist on load balancer')
