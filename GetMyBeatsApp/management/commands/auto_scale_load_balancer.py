from django.core.management.base import BaseCommand
from django.conf import settings

from GetMyBeatsApp.services.digital_ocean_service import DigitalOceanService


class Command(BaseCommand):  # TODO: pass self health check before kickoff
    help = """add the calling app instance to the load balancer node pool while also removing the older instance.
    passing the '--preserve-existing' flag will preserve the older instance
    """

    def add_arguments(self, parser):
        parser.add_argument("--preserve-existing", action='store_true',
                            help='flag to preserve the other existing app instance in the scaling process')

    def handle(self, *args, **options):
        service = DigitalOceanService(settings.DIGITALOCEAN_API_HOST, settings.DIGITALOCEAN_BEARER_TOKEN)
        upscale_was_successful = service.upscale_load_balancer()
        print(upscale_was_successful)

        downscale_was_successful = None
        preserve_existing_nodes = options.get('preserve_existing')
        if not preserve_existing_nodes:
            droplets_details = service.get_droplets_details()
            load_balancer_details = service.get_load_balancer_details()['load_balancer']
            load_balancer_droplet_ids = load_balancer_details['droplet_ids']
            oldest_node_in_pool = DigitalOceanService.sort_droplet_ids_by_oldest(droplets_details, load_balancer_droplet_ids)[0]
            if oldest_node_in_pool in load_balancer_droplet_ids:
                downscale_was_successful = service.downscale_load_balancer(oldest_node_in_pool)
            else:
                print(f'node {oldest_node_in_pool} was marked as the oldest but did not exist on load balancer')
        print(downscale_was_successful)
