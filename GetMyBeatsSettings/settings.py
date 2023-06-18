import os
import json
import platform
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']  # collectstatic needs this key

ALLOWED_HOSTS = ['.getmybeats.com', '127.0.0.1']

PLATFORM = platform.platform()
USE_LINUX = 'Linux' in PLATFORM or 'linux' in PLATFORM
DEBUG = not USE_LINUX

# https://stackoverflow.com/questions/29573163/django-admin-login-suddenly-demanding-csrf-token
# in general, future form POST's will probably need the CSRF cookie embedded into the Origin header
CSRF_TRUSTED_ORIGINS = [  # https://docs.djangoproject.com/en/4.2/ref/settings/
    'http://127.0.0.1:8000',  # Docker exposes nginx via port 8000
    'https://*.127.0.0.1',
    'https://*.getmybeats.com'
]

S3_AUDIO_BUCKET = 'getmybeats-audio'


# Application definition
INSTALLED_APPS = [
    'GetMyBeatsApp.apps.GetMyBeatsAppConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'GetMyBeatsSettings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WEBPACK_LOADER = {
#   "DEFAULT": {
#     "BUNDLE_DIR_NAME": "GetMyBeatsApp/static/webpack/",
#     "STATS_FILE": os.path.join(BASE_DIR, "webpack-stats.json")
#   }
# }


# https://docs.djangoproject.com/en/4.1/ref/settings/#databases
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


AUDIO_CACHE_EXPIRY_SECONDS = 60 * 60 * 24  # 24 hours
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.filebased.FileBasedCache",
        "LOCATION": "/application/_dj_cache" if USE_LINUX else BASE_DIR / '_dj_cache'
    }
}


# EXAMPLE LOGGING CALL:
# extra = {settings.LOGGER_EXTRA_DATA_KEY: 'all noodles are good'}
# logger.info('example', extra=extra)

# temporary hack to configure OS-based file paths until a reliable virtualization mechanism is found
LOGGING_FILEPATH_CONFIG = {
    'default': '/var/log/django/{filename}' if USE_LINUX else '{filename}'
}

DEFAULT_LOGGING_FORMAT = '''\
{levelname} | {name} | {asctime} | PID: {process:d} | THREAD: {thread:d} | MESSAGE: {message} >>> {DATA}\
'''.replace('\n', ' ')

LOGGER_EXTRA_DATA_KEY = 'DATA'  # MUST mesh with custom key specified in VERBOSE_LOGGING_FORMAT; in all caps for clarity

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
            'filename': LOGGING_FILEPATH_CONFIG['default'].format(filename='general.log'),
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


WSGI_APPLICATION = 'GetMyBeatsSettings.wsgi.application'
AUTH_USER_MODEL = 'GetMyBeatsApp.User'


# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}
]


# https://docs.djangoproject.com/en/4.1/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# https://docs.djangoproject.com/en/4.1/howto/static-files/
STATIC_ROOT = '/application/static/' if USE_LINUX else BASE_DIR / 'static'
STATIC_URL = '/static/'
MEDIA_ROOT = '/application/media/' if USE_LINUX else BASE_DIR / 'media'
MEDIA_URL = '/media/'


# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
