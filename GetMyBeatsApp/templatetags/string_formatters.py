import os

from django import template


register = template.Library()


# TODO: verify whether all methods are still valid
# TODO: unit test valid methods


class CharacterString:
    SPACE = ' '
    UNDERSCORE = '_'
    NULL = ''
    PLACEHOLDER = 'XXXXXX'


class CharacterInt:
    # TODO: use str.isalpha() for letter validation
    A = 65
    a = 97
    Z = 90
    z = 122
    UNDERSCORE = 95


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
    new_title = ''
    for character in string:
        is_lowercase = ord(character) >= CharacterInt.a and ord(character) <= CharacterInt.z
        is_uppercase = ord(character) >= CharacterInt.A and ord(character) <= CharacterInt.Z
        is_letter = is_lowercase or is_uppercase
        is_underscore = ord(character) == CharacterInt.UNDERSCORE
        is_space = character == CharacterString.SPACE

        if is_letter:
            new_title += character.lower()
            continue
        if is_space:
            new_title += CharacterString.UNDERSCORE
            continue
        if is_underscore:
            new_title += character
    return new_title


def get_sanitized_local_path(path):
    pass


def get_sanitized_s3_path(path):  # s3://getmybeats-audio-dev/NOODLES.wav --> s3://getmybeats-audio-dev/noodles.wav
    protocol = 's3://'
    basename = os.path.basename(path)
    ext = os.path.splitext(path)[1]
    bucket = path.replace(protocol, '').replace(basename, '')
    sanitized = protocol + bucket

    for character in basename:
        is_lowercase = ord(character) >= CharacterInt.a and ord(character) <= CharacterInt.z
        is_uppercase = ord(character) >= CharacterInt.A and ord(character) <= CharacterInt.Z
        is_letter = is_lowercase or is_uppercase
        is_underscore = ord(character) == CharacterInt.UNDERSCORE
        is_space = character == CharacterString.SPACE

        if is_letter:
            sanitized += character.lower()
            continue
        if is_space:
            sanitized += CharacterString.UNDERSCORE
            continue
        if character in ext:
            sanitized += character
            continue
        if is_underscore:
            sanitized += character
    return sanitized


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, CharacterString.NULL)


@register.filter
def charx_to_space(string, charx):
    return string.replace(charx, CharacterString.SPACE)


@register.filter
def space_to_charx(string, charx):
    return string.replace(CharacterString.SPACE, charx)


@register.filter
def title_to_py(string):
    """
    Foo Bar -> foo_bar
    """
    return CharacterString.UNDERSCORE.join(token.lower() for token in string.split(CharacterString.SPACE))


@register.filter
def title_to_js(string):
    """
    Foo Bar -> FooBar
    """
    return string.replace(CharacterString.SPACE, CharacterString.NULL)


@register.filter
def python_to_titleized_js(string):
    """
    foo_bar -> FooBar
    """
    return CharacterString.NULL.join(token.capitalize() for token in string.split(CharacterString.UNDERSCORE))
