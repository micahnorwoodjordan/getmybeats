import os
import json

from GetMyBeatsSettings.settings import *


USE_LINUX = False
DEBUG = True

CSRF_TRUSTED_ORIGINS = ['http://127.0.0.1', 'http://localhost', 'http://localhost:4200']

ALLOWED_HOSTS = ['*']
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_ALL_ORIGINS = True

DIGITALOCEAN_SETTINGS = json.loads(os.environ['DIGITALOCEAN_SETTINGS'])
DIGITALOCEAN_API_HOST = DIGITALOCEAN_SETTINGS['DIGITALOCEAN_API_HOST']
DIGITALOCEAN_BEARER_TOKEN = DIGITALOCEAN_SETTINGS['DIGITALOCEAN_BEARER_TOKEN']
DIGITALOCEAN_LOAD_BALANCER_ID = DIGITALOCEAN_SETTINGS['DIGITALOCEAN_LOAD_BALANCER_ID']
DIGITALOCEAN_FIREWALL_ID = DIGITALOCEAN_SETTINGS['DIGITALOCEAN_FIREWALL_ID']
del DIGITALOCEAN_SETTINGS


DATABASE_SETTINGS = json.loads(os.environ['DATABASE_SETTINGS'])
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DATABASE_SETTINGS['DBNAME'],
        'HOST': DATABASE_SETTINGS['DBHOST'],
        'USER': DATABASE_SETTINGS['DBUSER'],
        'PASSWORD': DATABASE_SETTINGS['DBPASSWORD'],
        'PORT': DATABASE_SETTINGS['DBPORT']
    }
}
del DATABASE_SETTINGS

REDIS_SETTINGS = json.loads(os.environ['REDIS_SETTINGS'])
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://{user}:{password}@{host}:{port}".format(
            user=REDIS_SETTINGS['USER'],
            password=REDIS_SETTINGS['PASSWORD'],
            host=REDIS_SETTINGS['HOST'],
            port=REDIS_SETTINGS['PORT']
        ),
    }
}
del REDIS_SETTINGS
