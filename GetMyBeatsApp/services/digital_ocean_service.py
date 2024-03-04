import requests
import datetime

from django.conf import settings


class DigitalOceanService:

    METADATA_INTERNAL_IP = '169.254.169.254'

    ADD_DROPLET_SUCCESS_STATUS = 204

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
        return response.json()

    def __get_droplet_id(self):
        metadata_dict = self.__get_droplet_metadata()
        return metadata_dict['droplet_id']

    def get_droplets_details(self):
        url = self.api_host + '/v2' + '/droplets/'
        response = requests.get(url, headers=self.auth_headers)
        return response.json()

    def get_load_balancer_details(self):
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID
        response = requests.get(url, headers=self.auth_headers)
        return response.json()

    def upscale_load_balancer(self):
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID + '/droplets'
        droplet_ids = [self.__get_droplet_id()]
        data = {
            'droplet_ids': droplet_ids
        }
        was_success = False
        response = requests.post(url, headers=self.auth_headers, json=data)
        if response.status_code == DigitalOceanService.ADD_DROPLET_SUCCESS_STATUS:
            was_success = True
        return was_success

    def downscale_load_balancer(self, node_id):
        url = self.api_host + '/v2' + '/load_balancers/' + settings.DIGITALOCEAN_LOAD_BALANCER_ID + '/droplets'
        data = {
            'droplet_ids': [node_id]
        }
        response = requests.delete(url, headers=self.auth_headers, json=data)
        return response.json()

    @staticmethod
    def sort_droplet_ids_by_oldest(details):
        # 2024-03-04T07:11:27Z
        ids_sorted = []
        dt_format = '%Y-%m-%dT%H:%M:%SZ'
        droplet_ids_by_timestamp = {
            datetime.datetime.strptime(droplet['created_at'], dt_format): droplet['id'] for droplet in details['droplets']
        }
        droplet_ids_by_oldest = dict(sorted(droplet_ids_by_timestamp.items()))
        for i in droplet_ids_by_oldest.values():
            ids_sorted.append(i)
        return ids_sorted
