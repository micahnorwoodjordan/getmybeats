from django import template

register = template.Library()

SPACE = ' '
UNDERSCORE = '_'
NULL_CHARACTER = ''


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, NULL_CHARACTER)


@register.filter
def charx_to_space(string, charx):
    return string.replace(charx, SPACE)


@register.filter
def space_to_charx(string, charx):
    return string.strip().replace(SPACE, charx)


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
    return string.replace(SPACE, NULL_CHARACTER)


@register.filter
def python_to_titleized_js(string):
    """
    foo_bar -> FooBar
    """
    return NULL_CHARACTER.join(token.capitalize() for token in string.split(UNDERSCORE))


@register.filter
def titleize(string):
    tokens = string.split(' ')
    sanitized = ' '.join([token[0].upper() + token[1:] for token in tokens])
    return sanitized
