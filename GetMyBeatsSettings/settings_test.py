import sys

from GetMyBeatsSettings.settings import *
from GetMyBeatsSettings.config.dev import *
# pull from all relevant settings modules to keep django from bugging out at runtime

TEST_INVOCATION_ARGS = ['manage.py', 'test', '--settings=GetMyBeatsSettings.settings_test']


CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

if all(arg in TEST_INVOCATION_ARGS for arg in sys.argv):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'USER': 'root',
            'NAME': 'testcontainer_getmybeats',
            'PASSWORD': 'Password1!',
            'HOST': 'testdb',  # name of docker container
            'PORT': '3306',
        }
    }
