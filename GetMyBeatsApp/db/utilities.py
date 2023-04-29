import base64

from GetMyBeatsApp.models import Audio
from GetMyBeatsApp.serializers import AudioSerializer


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    return base64.b64encode(open(filepath, "rb").read())


def get_main_audio_context():
    """
    the site index requests all Audio objects from the database. this function organizes and filters the
    data from these object instances for further client-side processing.
    """
    all_audio_instances = Audio.objects.all()
    context = {
        'filtered_audio': [{status.name: [] for status in Audio.Status}],
        'all_audio': [dict(audio) for audio in AudioSerializer(all_audio_instances, many=True).data],
        'statuses': set([Audio.Status(audio.status).name for audio in all_audio_instances])
    }

    for filter in context['filtered_audio']:
        for status, song_collection in filter.items():
            for audio in AudioSerializer(all_audio_instances.filter(status=Audio.Status[status].value), many=True).data:
                song_collection.append(dict(audio))

    return context
