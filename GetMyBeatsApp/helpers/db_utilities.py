import os
import bcrypt

from GetMyBeatsApp.templatetags.string_formatters import UNDERSCORE, space_to_charx


def get_new_hashed_audio_filename(filename):
    return bcrypt.hashpw(filename.encode(), bcrypt.gensalt()).decode().replace('/', '')


def sanitize_audio_title(title):
    return space_to_charx(title, UNDERSCORE).lower()


def get_file_upload_path_pre_save(instance, filename):  # madatory construct to work around the FileField limitations
    ext = filename.split('.')[-1]
    result = f"{sanitize_audio_title(instance.title)}.{ext}"
    return result
