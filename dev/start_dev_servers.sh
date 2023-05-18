#!/usr/bin/env bash

DIR="/application/getmybeats/media"
cd /application/getmybeats && source ../getmybeatsvenv/bin/activate


echo "scanning for audio artifacts"

if [ "$(ls -A $DIR)" ]; then
     echo "artifacts already installed. moving on.."
	else
    echo "installing audio artifacts..."
    ./manage.py download_missing_audio
    echo "artifacts installed successfully."
fi

echo "installing configuration files..."
./manage.py collectstatic --no-input
echo "configuration files installed successfully."


echo "starting gunicorn and nginx"
(cd /application/getmybeats && gunicorn GetMyBeatsSettings.wsgi --user root --bind 0.0.0.0:8010 --workers 3) & nginx -g "daemon off;"
echo "killing gunicorn and nginx"
