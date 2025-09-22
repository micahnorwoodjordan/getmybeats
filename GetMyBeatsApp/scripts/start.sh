# this script simplifies the production release on DigitalOcean's App Platform
# instead of delegating the deployment commands to the App Platform App Spec, this script allows those commands to be checked in to version control
# if/when deployment commands change, no App Spec update needs to be made, since the deployment controller simply needs to call `sh GetMyBeatsApp/scripts/start.sh` as the only command

set -e  # fail on 1st error


mkdir media &&
python manage.py test &&
python manage.py download_missing_audio &&
python manage.py rotate_audio_filename_hashes &&
python manage.py record_production_release &&
echo "deployment bootstrapping complete. health checks should begin shortly..." &&
gunicorn --worker-tmp-dir /dev/shm -c GetMyBeatsApp/digitalocean/gunicorn/gunicorn_config.py GetMyBeatsSettings.wsgi &&
