from django import template

register = template.Library()


@register.filter
def strip_charx(string, charx):
    return string.replace(charx, '')

@register.filter
def charx_to_space(string, charx):
    space = ' '
    return string.replace(charx, space)
