from GetMyBeatsSettings.settings import *
from GetMyBeatsSettings.config.dev import *
# pull from all relevant settings modules to keep django from bugging out at runtime


CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}
