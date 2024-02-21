import base64

from django.conf import settings
from django.core.cache import cache
from django.utils.timezone import now

from GetMyBeatsApp.models import Audio
from GetMyBeatsApp.serializers import AudioSerializer


NEW_AUDIO_UPLOAD_CACHE_KEY = f'NEW-UPLOAD-{now().strftime("%Y.%m.%d")}'


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    return base64.b64encode(open(filepath, "rb").read())


def get_main_audio_context(client_address):
    """
    fetch Audio objects from the site cache or database, and organize object attributes for client-side processing
    :param client_address: str
    :return dict
    """
    fields = ['id', 'uploaded_at', 'title', 'length', 'file_upload', 'status', 's3_audio_upload_path']
    audios = cache.get(client_address)
    if audios is None:
        audios = Audio.objects.order_by('-id').only(*fields)
        cache_key = f'landing-page-audio-context-{client_address}'
        cache.add(cache_key, audios, timeout=settings.AUDIO_CACHE_EXPIRY_SECONDS)
    context = {'audio': [dict(audio) for audio in AudioSerializer(audios, many=True).data]}
    return context
