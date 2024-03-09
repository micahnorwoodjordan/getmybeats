import os

from GetMyBeatsSettings.settings import *


USE_LINUX = False
DEBUG = True

ALLOWED_HOSTS = [
    '127.0.0.1',
    '192.168.0.180'
]

CSRF_TRUSTED_ORIGINS = [  # https://docs.djangoproject.com/en/4.2/ref/settings/
    'http://127.0.0.1:8000',  # Docker exposes nginx via port 8000
    'http://192.168.0.180:8000'
    'https://*.127.0.0.1',
]

DIGITALOCEAN_API_HOST = os.environ['DIGITALOCEAN_API_HOST']
DIGITALOCEAN_BEARER_TOKEN = os.environ['DIGITALOCEAN_BEARER_TOKEN']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'getmybeats_local',
        'HOST': '127.0.0.1',
        'USER': 'root',
        'PASSWORD': 'Password1!',
        'PORT': 3306
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://default:Password1!@127.0.0.1:6379",
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
            'filename': 'general.log',
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

STATIC_ROOT = BASE_DIR / 'static'
MEDIA_ROOT = BASE_DIR / 'media'


S3_AUDIO_BUCKET = 'getmybeats-audio-dev'
