import os

from django import template


register = template.Library()


# TODO: verify whether all methods are still valid
# TODO: unit test valid methods


SPACE = ' '
UNDERSCORE = '_'
NULL = ''
PLACEHOLDER_TEXT = 'XXXXXX'


def validate_s3_path(path):
    msg = f'invalid s3 path: {path}'

    protocol = 's3://'
    if protocol not in path:
        raise Exception(msg)

    ext = os.path.splitext(path)[1]
    if ext == '':
        raise Exception(msg)

    basename = os.path.basename(path)
    bucket = path.replace(protocol, '').replace(basename, '')
    if bucket == '':
        raise Exception(msg)


def get_sanitized_title(string):  # MY NOODLES --> my_noodles
    A = 65
    a = 97
    Z = 90
    z = 122
    underscore = 95
    new_title = ''
    for character in string:
        is_lowercase = ord(character) >= a and ord(character) <= z
        is_uppercase = ord(character) >= A and ord(character) <= Z
        is_letter = is_lowercase or is_uppercase
        is_underscore = ord(character) == underscore
        is_space = character == ' '

        if is_letter:
            new_title += character.lower()
            continue
        if is_space:
            new_title += UNDERSCORE
            continue
        if is_underscore:
            new_title += character
    return new_title


def get_sanitized_s3_path(path):  # s3://getmybeats-audio-dev/NOODLES.wav --> s3://getmybeats-audio-dev/noodles.wav
    A = 65
    a = 97
    Z = 90
    z = 122
    underscore = 95

    protocol = 's3://'
    basename = os.path.basename(path)
    ext = os.path.splitext(path)[1]
    bucket = path.replace(protocol, '').replace(basename, '')
    sanitized = protocol + bucket

    for character in basename:
        is_lowercase = ord(character) >= a and ord(character) <= z
        is_uppercase = ord(character) >= A and ord(character) <= Z
        is_letter = is_lowercase or is_uppercase
        is_underscore = ord(character) == underscore
        is_space = character == ' '

        if is_letter:
            sanitized += character.lower()
            continue
        if is_space:
            sanitized += UNDERSCORE
            continue
        if character in ext:
            sanitized += character
            continue
        if is_underscore:
            sanitized += character
    return sanitized


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, NULL)


@register.filter
def charx_to_space(string, charx):
    return string.replace(charx, SPACE)


@register.filter
def space_to_charx(string, charx):
    return string.replace(SPACE, charx)


@register.filter
def title_to_py(string):
    """
    Foo Bar -> foo_bar
    """
    return UNDERSCORE.join(token.lower() for token in string.split(SPACE))


@register.filter
def title_to_js(string):
    """
    Foo Bar -> FooBar
    """
    return string.replace(SPACE, NULL)


@register.filter
def python_to_titleized_js(string):
    """
    foo_bar -> FooBar
    """
    return NULL.join(token.capitalize() for token in string.split(UNDERSCORE))
