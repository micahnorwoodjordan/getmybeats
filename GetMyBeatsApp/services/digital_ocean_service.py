import requests

from django.conf import settings


class DigitalOceanService:
    # interface directly with droplets and load balancer
    def __init__(self, api_host=settings.DIGITALOCEAN_API_HOST, auth_token=settings.DIGITALOCEAN_BEARER_TOKEN):
        self.auth_token = auth_token
        self.api_host = api_host
        self.set_auth_headers()

    def set_auth_headers(self):
        self.auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.auth_token
        }

    def get_droplets_details(self):
        url = self.api_host + '/v2' + '/droplets/'
        response = requests.get(url, headers=self.auth_headers)
        return response.json()
