import os
import json

from GetMyBeatsSettings.settings import *


USE_LINUX = False
DEBUG = True

ALLOWED_HOSTS = ['*']

CSRF_TRUSTED_ORIGINS = [  # https://docs.djangoproject.com/en/4.2/ref/settings/
    'http://127.0.0.1',
    'http://getmybeats.api.local'
]
SECURE_CROSS_ORIGIN_OPENER_POLICY = None  # local development only
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_HEADERS = ['*']

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

S3_AUDIO_BUCKET = 'getmybeats-audio-dev'
S3_ARTWORK_BUCKET = 'getmybeats-images-dev'
