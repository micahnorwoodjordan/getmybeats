import os
import bcrypt

from GetMyBeatsApp.templatetags.string_formatters import UNDERSCORE, space_to_charx


def get_new_hashed_filename(filename):
    return bcrypt.hashpw(filename.encode(), bcrypt.gensalt()).decode().replace('/', '')


def lowercase_filename(instance, filename):
    base, ext = os.path.splitext(filename)
    return base.lower() + ext


def sanitize_audio_title(title):
    return space_to_charx(title, UNDERSCORE).lower()
