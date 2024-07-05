import os
import time

from django.conf import settings
from django.dispatch import receiver
from django.core.cache import cache
from django.db.models.signals import pre_save, post_save, post_delete


from GetMyBeatsApp.models import Audio
from GetMyBeatsApp.services.s3_service import S3AudioService


# TODO: still tech debt: even updating a single field, like title, will perform two file IO operations
# https://stackoverflow.com/questions/51075396/python-django-does-not-overwrite-newly-uploaded-file-with-old-one
@receiver(pre_save, sender=Audio, dispatch_uid=time.time())
def audio_pre_save(sender, instance, **kwargs):
    fp = instance.file.path
    if instance.id:
        if os.path.exists(fp):
            os.remove(fp)


# only upload to s3 after file is committed to the file system
@receiver(post_save, sender=Audio, dispatch_uid=time.time())
def audio_post_save(sender, instance, created, **kwargs):
    if created:
        filename = instance.title + instance.ext
        S3AudioService().upload(instance.file.path, filename)
        instance.s3_upload_path = f's3://{settings.S3_AUDIO_BUCKET}/{filename}'
        instance.title = filename.replace(instance.ext, '')
        instance.save()

    if not os.path.exists(instance.file.path):
        with open(instance.file.path, 'wb') as f:
            f.write(instance.file.read())

    cache.clear()


@receiver(post_delete, sender=Audio)
def audio_post_delete(sender, **kwargs):
    cache.clear()
