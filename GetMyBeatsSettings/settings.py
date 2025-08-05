import os

from pathlib import Path


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']  # collectstatic needs this key

USE_LINUX = False
DEBUG = False

PROHIBITED_USER_AGENT_SUBSTRINGS = ['curl']

# https://stackoverflow.com/questions/29573163/django-admin-login-suddenly-demanding-csrf-token
# in general, future form POST's will probably need the CSRF cookie embedded into the Origin header


# Application definition
INSTALLED_APPS = [
    'GetMyBeatsApp.apps.GetMyBeatsAppConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders'
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
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


AUDIO_CACHE_EXPIRY_SECONDS = 60 * 30  # 30 minutes

LOGGER_EXTRA_DATA_KEY = 'DATA'  # MUST mesh with custom key specified in VERBOSE_LOGGING_FORMAT; in all caps for clarity
DEFAULT_LOGGING_FORMAT = '{levelname} | {name} | {asctime} | MESSAGE: {message} >>> {DATA}'

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
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

STATIC_ROOT = BASE_DIR / "static"
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# TODO: rename to DigitalOcean and consolidate
AWS_ACCESS_KEY = os.environ['AWS_ACCESS_KEY']
AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_ACCESS_KEY']
S3_BUCKET_URL = os.environ['S3_BUCKET_URL']
S3_BUCKET_NAME = os.environ['S3_BUCKET_NAME']
REGION = os.environ['REGION']
