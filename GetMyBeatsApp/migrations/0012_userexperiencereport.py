# Generated by Django 4.2.10 on 2024-07-19 05:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GetMyBeatsApp', '0011_rename_file_upload_audio_file_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserExperienceReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('issues', models.JSONField()),
                ('upcoming', models.JSONField()),
                ('recent', models.JSONField()),
            ],
        ),
    ]
