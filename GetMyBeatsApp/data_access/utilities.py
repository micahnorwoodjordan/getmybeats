import base64
import logging

from django.conf import settings
from django.db import transaction, IntegrityError
from django.core.cache import cache
from django.utils.timezone import now

from GetMyBeatsApp.models import Audio, SiteVisitRequest
from GetMyBeatsApp.serializers import AudioSerializer


logger = logging.getLogger(__name__)


NEW_AUDIO_UPLOAD_CACHE_KEY = f'NEW-UPLOAD-{now().strftime("%Y.%m.%d")}'


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    return base64.b64encode(open(filepath, "rb").read())


def get_audio_filenames():
    return [name for name in Audio.objects.all().values_list('file_upload', flat=True)]


def get_main_audio_context(client_address):
    """
    fetch Audio objects from the site cache or database, and organize object attributes for client-side processing
    :param client_address: str
    :return dict
    """
    fields = ['id', 'uploaded_at', 'title', 'length', 'file_upload', 'status']
    cache_key = 'user-site-audio-context-' + client_address
    audios = cache.get(cache_key)

    if audios is None:
        audios = Audio.objects.order_by('-id').only(*fields)
        cache.add(cache_key, audios, timeout=settings.AUDIO_CACHE_EXPIRY_SECONDS)

    context = {
        'filtered_audio': [{status.name: [] for status in Audio.Status}],
        'all_audio': [dict(audio) for audio in AudioSerializer(audios, many=True).data],
        'statuses': set([Audio.Status(audio.status).name for audio in audios])
    }

    for filter in context['filtered_audio']:
        for status, song_collection in filter.items():
            for audio in AudioSerializer(audios.filter(status=Audio.Status[status].value), many=True).data:
                song_collection.append(dict(audio))

    return context


def record_request_information(request):
    recorded_site_visit = None

    remote_ip_address = request.META['HTTP_X_FORWARDED_FOR']
    params = request.META['QUERY_STRING']
    headers = {k: v for k, v in request.headers.items()}
    body = {k: v for k, v in request.POST.items()}
    user_agent = headers['User-Agent']
    method = request.method

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

    return recorded_site_visit
