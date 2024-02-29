import os
import pathvalidate

from django import template


register = template.Library()


# TODO: verify whether all methods are still valid
# TODO: unit test valid methods


class CharacterString:
    SPACE = ' '
    UNDERSCORE = '_'
    DASH = '-'
    NULL = ''
    PLACEHOLDER = 'XXXXXX'


class CharacterInt:
    # TODO: use str.isalpha() for letter validation
    A = 65
    a = 97
    Z = 90
    z = 122
    UNDERSCORE = 95
    DASH = 45


def get_sanitized_title(string):  # MY NOODLES --> my_noodles
    new_title = ''
    for character in string:
        is_lowercase = ord(character) >= CharacterInt.a and ord(character) <= CharacterInt.z
        is_uppercase = ord(character) >= CharacterInt.A and ord(character) <= CharacterInt.Z
        is_letter = is_lowercase or is_uppercase
        is_underscore = ord(character) == CharacterInt.UNDERSCORE
        is_dash = ord(character) == CharacterInt.DASH
        is_space = character == CharacterString.SPACE

        if is_letter:
            new_title += character.lower()
            continue
        if is_space:
            new_title += CharacterString.UNDERSCORE
            continue
        if is_dash:
            new_title += CharacterString.UNDERSCORE
            continue
        if is_underscore:
            new_title += character
    return new_title


def get_sanitized_local_path(path):
    pass


def get_sanitized_s3_uri(path):
    """an honest attempt at sanitizing S3 URI's.
    this method wraps the `sanitize_filepath` function from the `pathvalidate` package.
    it does a wonderful job, but isn't perfect. the extra logic attempts to parse out the "s3/" artifact,
    as well as check for space characters in the bucket name, which are illegal per AWS S3 spec.
    """
    artifact = 's3/'
    protocol = 's3://'
    almost_sanitized = pathvalidate.sanitize_filepath(path).replace(artifact, CharacterString.NULL)
    almost_sanitized = almost_sanitized.replace(CharacterString.SPACE, CharacterString.UNDERSCORE)
    sanitized = protocol + pathvalidate.sanitize_filepath(almost_sanitized)
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
