import json
import os

from GetMyBeatsSettings.settings import *


USE_LINUX = True
DEBUG = False

CSRF_TRUSTED_ORIGINS = ['https://getmybeats.com']

ALLOWED_HOSTS = ['*']

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
    'version': 1,
    'disable_existing_loggers': False,
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': True,
        },
        'django.request': {
            'handlers': ['error_console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'GetMyBeatsApp': {
            'level': 'DEBUG',
            'handlers': ['console'],
            
            'propagate': False,
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'error_console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
            'level': 'ERROR',
        },
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} [{name}] {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname}: {message}',
            'style': '{',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    }
}
