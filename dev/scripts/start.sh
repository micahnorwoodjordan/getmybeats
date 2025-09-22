python manage.py test &&
python manage.py migrate GetMyBeatsApp &&
python manage.py download_missing_audio &&
python manage.py rotate_audio_filename_hashes &&
python manage.py record_production_release &&
echo 'starting gunicorn' &&
gunicorn -c dev/gunicorn/config.py GetMyBeatsSettings.wsgi
