import json
import os

from GetMyBeatsSettings.settings import *


USE_LINUX = True
DEBUG = False

ALLOWED_HOSTS = [
    '.getmybeats.com',
    'cloud.digitalocean.com'
]

DIGITALOCEAN_API_HOST = os.environ['DIGITALOCEAN_API_HOST']
DIGITALOCEAN_BEARER_TOKEN = os.environ['DIGITALOCEAN_BEARER_TOKEN']
DIGITALOCEAN_LOAD_BALANCER_ID = os.environ['DIGITALOCEAN_LOAD_BALANCER_ID']

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

LOGGING = {
    'version': 1,  # the dictConfig format version
    'disable_existing_loggers': False,
    'loggers': {
        'GetMyBeatsApp': {
            'level': 'INFO',
            'handlers': ['general']
        }
    },
    'handlers': {
        'general': {
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/general.log',
            'level': 'INFO',
            'formatter': 'verbose',
        },
    },
    'formatters': {
        'verbose': {
            'format': DEFAULT_LOGGING_FORMAT,
            'style': '{'
        },
    }
}

STATIC_ROOT = '/application/static/'
MEDIA_ROOT = '/application/media/'

S3_AUDIO_BUCKET = 'getmybeats-audio'
