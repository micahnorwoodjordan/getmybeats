import base64

from django.conf import settings


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    filepath = f'{settings.MEDIA_ROOT}{filepath}'
    return base64.b64encode(open(filepath, "rb").read())

