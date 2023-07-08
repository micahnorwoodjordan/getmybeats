#!/usr/bin/env bash
# set -e  # fail and return on first non-zero exit status

APPLICATION_DIR=/application/getmybeats/
MEDIA_DIR=/application/media


cd $APPLICATION_DIR && source ../getmybeatsvenv/bin/activate
./manage.py collectstatic --no-input
echo "done"


echo "verifying aws credentials..."
cd dev/aws/
sh install_credentials.sh

cd $APPLICATION_DIR
echo "scanning for audio artifacts"
if [ "$(ls -A $MEDIA_DIR)" ]
    then
        echo "artifacts already installed. nothing to do"
	else
        echo "installing audio artifacts..."
        ./manage.py download_missing_audio
        echo "done"
fi


echo "bundling frontend..."
cd $APPLICATION_DIR/frontend
npm install
npm run build
echo "finished bundling"



echo "starting gunicorn and nginx"
(cd $APPLICATION_DIR && gunicorn GetMyBeatsSettings.wsgi --user root --bind 0.0.0.0:8010 --workers 3) & nginx -g "daemon off;"
echo "killing gunicorn and nginx"
