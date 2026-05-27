import json
import os

from corsheaders.defaults import default_headers

from GetMyBeatsSettings.settings import *


USE_LINUX = True
DEBUG = False

CSRF_TRUSTED_ORIGINS = ['https://getmybeats.com']

ALLOWED_HOSTS = ['*']  # TODO: dont forget to update

CORS_ALLOW_HEADERS = list(default_headers) + ['Audio-Request-Id']
CORS_ALLOWED_ORIGINS = ["https://getmybeats.com"]

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
