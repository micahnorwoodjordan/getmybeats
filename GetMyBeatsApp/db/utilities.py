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
    fields = ['id', 'uploaded_at', 'title', 'length', 'file_upload', 'status']
    audios = cache.get(client_address)

    if audios is None:
        audios = Audio.objects.all().only(*fields)
        cache.add(client_address, audios, timeout=settings.AUDIO_CACHE_EXPIRY_SECONDS)

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
