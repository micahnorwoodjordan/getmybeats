import base64

from django.conf import settings


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    filepath = f'{settings.MEDIA_ROOT}{filepath}'
    return base64.b64encode(open(filepath, "rb").read())

