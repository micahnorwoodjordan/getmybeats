from django.db import models
from django.db import IntegrityError, connection, models, transaction
from django.contrib.auth.models import AbstractUser

from django.utils.timezone import now

class User(AbstractUser):
    email = models.CharField(max_length=100, blank=False, null=False, unique=True)
    username = models.CharField(blank=False, max_length=50, null=False, unique=True)

    class Meta:
        db_table = 'auth_user'
        unique_together = ('username', 'email')
        managed = True

    def __str__(self):
        return f'{type(self)}: {self.id} -> {self.first_name} {self.last_name}'


class Audio(models.Model):
    id = models.AutoField(primary_key=True)
    fk_uploaded_by = models.ForeignKey('User', models.DO_NOTHING, null=False, blank=False)
    uploaded_at = models.DateTimeField(default=now())
    title = models.CharField(max_length=200, blank=False, null=False, unique=True)
    length = models.CharField(max_length=50, blank=True, null=True)  # TODO: look into django types that might be better to store audio duration data
    raw_bytes = models.BinaryField(max_length=1000)

    class Meta:
        db_table = 'audio'
        managed = True

    def __str__(self):
        return f'{type(self)}: {self.id} -> {self.title} uploaded by {self.fk_uploaded_by.username}'