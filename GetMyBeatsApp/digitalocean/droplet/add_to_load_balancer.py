import os
import requests


INTERNAL_IP = '169.254.169.254'
SUCCESS_STATUS = 204


def get_metadata():
    # droplet metadata: https://docs.digitalocean.com/reference/api/metadata-api/
    url = f'http://{INTERNAL_IP}/metadata/v1.json'
    metadata_dict = requests.get(url).json()
    return metadata_dict


def get_droplet_id_self():
    metadata_self = get_metadata()
    return metadata_self['droplet_id']


def post_add_droplet_to_load_balancer():
    bearer_token = os.environ['DIGITALOCEAN_BEARER_TOKEN']
    load_balancer_id = os.environ['DIGITALOCEAN_LOAD_BALANCER_ID']
    droplet_ids = [get_droplet_id_self()]

    url = f'https://api.digitalocean.com/v2/load_balancers/{load_balancer_id}/droplets'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + bearer_token
    }
    data = {
        'droplet_ids': droplet_ids
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == SUCCESS_STATUS:
        print('OPERATION SUCCESSFUL\n')
    else:
        try:
            print(response.json())  # possible json decode error
        except Exception as e:
            print(f'OPERATION FAILURE: {e}\n')


print('BEGIN OPERATION: add droplet to load balancer\n')
post_add_droplet_to_load_balancer()
print('END OPERATION: add droplet to load balancer\n')
