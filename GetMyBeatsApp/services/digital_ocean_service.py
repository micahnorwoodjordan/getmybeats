import logging
import requests
import datetime

from django.conf import settings

from GetMyBeatsApp.services.utilities import log_api_response


logger = logging.getLogger(__name__)


class DigitalOceanService:

    METADATA_INTERNAL_IP = '169.254.169.254'

    ADD_DROPLET_SUCCESS_STATUS = 204  # to load balancer node pool
    REMOVE_DROPLET_SUCCESS_STATUS = 204  # from load balancer node pool

    # interface directly with droplets and load balancer
    # for now, keep instances from knowing about others, except where it matters (downscaling)
    def __init__(self, api_host=settings.DIGITALOCEAN_API_HOST, auth_token=settings.DIGITALOCEAN_BEARER_TOKEN):
        self.auth_token = auth_token
        self.api_host = api_host
        self.set_auth_headers()

    def set_auth_headers(self):
        self.auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.auth_token
        }

    def __get_droplet_metadata(self):  # NOT an outgoing api call. instance accesses this file over a loopback request
        url = 'http://' + DigitalOceanService.METADATA_INTERNAL_IP + '/metadata/' + 'v1.json'
        response = requests.get(url)
        response_json = response.json()
        log_api_response(
            logger, response, DigitalOceanService.__get_droplet_metadata.__qualname__, response_json=response_json)
        return response_json

    def __get_droplet_id(self):
        metadata_dict = self.__get_droplet_metadata()
        return metadata_dict['droplet_id']

    def _get_droplet_hostname(self):
        metadata_dict = self.__get_droplet_metadata()
        return metadata_dict['hostname']

    def get_droplets_details(self):
        url = self.api_host + '/v2' + '/droplets/'
        response = requests.get(url, headers=self.auth_headers)
        response_json = response.json()
        log_api_response(
            logger, response, DigitalOceanService.get_droplets_details.__qualname__, response_json=response_json)
        return response_json

    def get_load_balancer_details(self):
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID
        response = requests.get(url, headers=self.auth_headers)
        response_json = response.json()
        log_api_response(
            logger, response, DigitalOceanService.get_load_balancer_details.__qualname__, response_json=response_json)
        return response_json

    def upscale_load_balancer(self):
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID + '/droplets'
        droplet_ids = [self.__get_droplet_id()]
        data = {
            'droplet_ids': droplet_ids
        }
        response = requests.post(url, headers=self.auth_headers, json=data)
        log_api_response(logger, response, DigitalOceanService.upscale_load_balancer.__qualname__)
        return True if response.status_code == DigitalOceanService.REMOVE_DROPLET_SUCCESS_STATUS else False

    def downscale_load_balancer(self, node_id):
        node_id = int(node_id)
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID + '/droplets'
        data = {
            'droplet_ids': [node_id]
        }
        response = requests.delete(url, headers=self.auth_headers, json=data)
        log_api_response(logger, response, DigitalOceanService.downscale_load_balancer.__qualname__)
        return True if response.status_code == DigitalOceanService.REMOVE_DROPLET_SUCCESS_STATUS else False

    @staticmethod
    def sort_droplet_ids_by_oldest(all_droplets_details, load_balancer_droplet_ids):
        # compare a `get all droplets` response with a `get all droplets in load balancer` response
        ids_sorted = []
        dt_format = '%Y-%m-%dT%H:%M:%SZ'  # example: 2024-03-04T07:11:27Z
        droplet_ids_by_timestamp = {
            datetime.datetime.strptime(droplet['created_at'], dt_format): droplet['id'] 
            for droplet in all_droplets_details['droplets']
        }
        droplet_ids_by_oldest = dict(sorted(droplet_ids_by_timestamp.items()))
        for i in droplet_ids_by_oldest.values():
            ids_sorted.append(i)
        ids_sorted_and_filtered = [i for i in ids_sorted if i in load_balancer_droplet_ids]
        return ids_sorted_and_filtered
