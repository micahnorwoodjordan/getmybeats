from django import template

register = template.Library()

TITLE_DELIMITER = ' '
PY_DELIMITER = '_'
JS_DELIMITER = ''


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, '')


@register.filter
def charx_to_space(string, charx):
    space = ' '
    return string.replace(charx, space)


@register.filter
def title_to_py(string):
    """
    Foo Bar -> foo_bar
    """
    return PY_DELIMITER.join(nugget.lower() for nugget in string.split(TITLE_DELIMITER))


@register.filter
def title_to_js(string):
    """
    Foo Bar -> FooBar
    """
    return string.replace(TITLE_DELIMITER, JS_DELIMITER)


@register.filter
def python_to_titleized_js(string):
    """
    foo_bar -> FooBar
    """
    return JS_DELIMITER.join(nugget.capitalize() for nugget in string.split(PY_DELIMITER))
