import os
import time
import logging

from django.dispatch import receiver
from django.db.models.signals import pre_save

from GetMyBeatsApp.models import Audio


logger = logging.getLogger(__name__)


# https://stackoverflow.com/questions/51075396/python-django-does-not-overwrite-newly-uploaded-file-with-old-one
@receiver(pre_save, sender=Audio, dispatch_uid=time.time())
def audio_pre_save(sender, instance, **kwargs):
    if os.path.exists(instance.file.path):
        os.remove(instance.file.path)
