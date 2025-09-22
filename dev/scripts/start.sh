set -e

export MYSQL_ROOT_PASSWORD="Password1!"
export MYSQL_HOST="db"

sh dev/db/import_db.sh
python manage.py test &&
python manage.py migrate GetMyBeatsApp &&
python manage.py download_missing_audio &&
python manage.py rotate_audio_filename_hashes &&
python manage.py record_production_release &&
echo 'starting gunicorn' &&
gunicorn -c dev/gunicorn/config.py GetMyBeatsSettings.wsgi
