import base64
import logging

from django.conf import settings
from django.db import transaction, IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import cache
from django.utils.timezone import now

from GetMyBeatsApp.models import Audio, SiteVisitRequest, ProductionRelease
from GetMyBeatsApp.serializers import AudioSerializer


logger = logging.getLogger(__name__)


NEW_AUDIO_UPLOAD_CACHE_KEY = f'NEW-UPLOAD-{now().strftime("%Y.%m.%d")}'
NEW_SITE_VISIT_REQUEST_CACHE_KEY_PREFIX = 'user-site-audio-context-'


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    return base64.b64encode(open(filepath, "rb").read())


def get_audio_filenames():
    return [name for name in Audio.objects.all().values_list('file_upload', flat=True).order_by('-id')]


def record_request_information(request):
    recorded_site_visit = None

    remote_ip_address = request.META['HTTP_X_FORWARDED_FOR']
    params = request.META['QUERY_STRING']
    headers = {k: v for k, v in request.headers.items()}
    body = {k: v for k, v in request.POST.items()}
    user_agent = headers['User-Agent']
    method = request.method
    site_vist_request_cache_key = NEW_SITE_VISIT_REQUEST_CACHE_KEY_PREFIX + remote_ip_address

    if not cache.get(site_vist_request_cache_key):
        try:
            with transaction.atomic():
                recorded_site_visit = SiteVisitRequest.objects.create(
                    ip=remote_ip_address,
                    params=params,
                    headers=headers,
                    method=method,
                    user_agent=user_agent,
                    body=str(body)
                )
        except IntegrityError as err:
            extra = {settings.LOGGER_EXTRA_DATA_KEY: str(err)}
            logger.error('record request data FAILURE', extra=extra)
        except Exception as err:
            extra = {settings.LOGGER_EXTRA_DATA_KEY: str(err)}
            logger.error('record request data FAILURE', extra=extra)

        # count" site visits; someone constantly refreshing the page doesnt count, for example
        cache.add(site_vist_request_cache_key, remote_ip_address)

    return recorded_site_visit


def get_release_by_id(release_id):
    if release_id == -1:
        release = ProductionRelease.objects.last()
        if release is None:
            raise ObjectDoesNotExist
    else:
        release = ProductionRelease.objects.get(id=release_id)
    return release
