import base64
import os

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


def get_audio_contexts():
    audio_contexts = []
    for audio in Audio.objects.all().order_by('-id'):  # most recent first
        audio_contexts.append(
            {
                'id': audio.id,
                'filepath': os.path.basename(audio.file_upload.path),
                'title': audio.title,
                'artist': 'me',
                # 'image': ''
            }
        )
    return audio_contexts
