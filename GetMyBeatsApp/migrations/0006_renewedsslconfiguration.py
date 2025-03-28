# Generated by Django 4.2.10 on 2024-05-03 18:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GetMyBeatsApp', '0005_productionrelease'),
    ]

    operations = [
        migrations.CreateModel(
            name='RenewedSSLConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('s3_path', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'renewed_ssl_configuration',
                'managed': True,
            },
        ),
    ]
