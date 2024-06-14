import base64

from GetMyBeatsApp.models import Audio


class AudioDAO:
    def __init__(self):
        pass

    def get_audio_by_id(self, audio_id):
        return Audio.objects.get(id=audio_id)

    @staticmethod
    def b64_encode_audio(audio):
        return base64.b64encode(open(audio.file_upload.path, "rb").read())
