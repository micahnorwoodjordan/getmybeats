from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.apps import apps

from .models import User, Audio

# reference: https://codinggear.blog/how-to-register-model-in-django-admin
for model in apps.get_models():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass