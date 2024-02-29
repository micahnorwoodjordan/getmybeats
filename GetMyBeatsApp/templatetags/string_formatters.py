import os
import pathlib
import pathvalidate

from django import template


register = template.Library()


# TODO: verify whether all methods are still valid
# TODO: unit test valid methods


class Character:
    SPACE = ' '
    UNDERSCORE = '_'
    DASH = '-'
    NULL = ''
    PLACEHOLDER = 'XXXXXX'
    PERIOD = '.'


def get_sanitized_title(string):
    sanitized = ''
    for character in string:
        is_letter = character.isalpha()
        is_number = character.isnumeric()
        is_underscore = character == Character.UNDERSCORE

        if any([is_letter, is_number, is_underscore]):
            sanitized += character.lower()
            continue
        if character == Character.SPACE or character == Character.DASH:
            sanitized += Character.UNDERSCORE
            continue
    return sanitized


def get_sanitized_local_path(path):
    """an attempt to normalize Django FileField upload paths. it's assumed that the filepaths are normal Posix paths.
    the criteria is that file names do not contain spaces or dashes, and have a valid extension"""
    basename = os.path.basename(path)
    sanitized_basename = basename.replace(Character.DASH, Character.UNDERSCORE).replace(Character.SPACE, Character.UNDERSCORE)
    ext = os.path.splitext(path)[-1]
    sanitized_ext = '.' + ext.split('.')[-1]
    almost_sanitized = pathvalidate.sanitize_filepath(pathvalidate.sanitize_filepath(path))  # 2x bc method != perfect
    sanitized = almost_sanitized.replace(basename, sanitized_basename).replace(ext, sanitized_ext)
    return sanitized


def get_sanitized_file_stem(stem):
    sanitized = ''
    almost_sanitized = stem.replace(Character.DASH, Character.UNDERSCORE).replace(Character.SPACE, Character.UNDERSCORE)

    length = len(almost_sanitized)
    for i in range(len(almost_sanitized)):
        current_character = almost_sanitized[i]
        next_character = almost_sanitized[i + 1] if i + 1 < length else None
        sequential_periods = all([current_character == Character.PERIOD, next_character == Character.PERIOD])
        final_character_is_period = next_character is None and current_character == Character.PERIOD

        if not sequential_periods and not final_character_is_period:
            is_valid_character = current_character in [Character.UNDERSCORE, Character.PERIOD] or \
                current_character.isalpha() or current_character.isnumeric()
            if is_valid_character:
                sanitized += current_character
    return sanitized


def get_sanitized_s3_uri(uri):
    """an honest attempt at sanitizing S3 URI's."""
    protocol = 's3://'
    path = pathlib.Path(uri)
    bucket_name = path.parts[1]
    sanitized_bucket_name = bucket_name.replace(Character.UNDERSCORE, Character.DASH).replace(Character.SPACE, Character.DASH)
    stem = path.stem
    sanitized_stem = get_sanitized_file_stem(stem)
    ext = path.parts[-1]
    sanitized_ext = Character.PERIOD + ext.split(Character.PERIOD)[-1]
    sanitized = os.path.join(protocol, sanitized_bucket_name, sanitized_stem + sanitized_ext)
    return sanitized


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, Character.NULL)


@register.filter
def charx_to_space(string, charx):
    return string.replace(charx, Character.SPACE)


@register.filter
def space_to_charx(string, charx):
    return string.replace(Character.SPACE, charx)


@register.filter
def title_to_py(string):
    """
    Foo Bar -> foo_bar
    """
    return Character.UNDERSCORE.join(token.lower() for token in string.split(Character.SPACE))


@register.filter
def title_to_js(string):
    """
    Foo Bar -> FooBar
    """
    return string.replace(Character.SPACE, Character.NULL)


@register.filter
def python_to_titleized_js(string):
    """
    foo_bar -> FooBar
    """
    return Character.NULL.join(token.capitalize() for token in string.split(Character.UNDERSCORE))
