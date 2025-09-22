set -e


mkdir media
python manage.py test
python manage.py download_missing_audio
python manage.py rotate_audio_filename_hashes
gunicorn --worker-tmp-dir /dev/shm -c GetMyBeatsApp/digitalocean/gunicorn/gunicorn_config.py GetMyBeatsSettings.wsgi
python manage.py record_production_release
