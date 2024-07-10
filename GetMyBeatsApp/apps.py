from django.apps import AppConfig


class GetMyBeatsAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'GetMyBeatsApp'

    def ready(self):
        # Implicitly connect signal handlers decorated with @receiver.
        from . import signals
