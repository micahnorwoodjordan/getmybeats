# Generated by Django 4.1.4 on 2023-05-18 06:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('GetMyBeatsApp', '0003_audio_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='audio',
            name='raw_bytes',
        ),
    ]