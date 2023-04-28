#! /bin/bash

cd ~


# code installation doesn't function during CF build process. Maybe bad ref to env var.
echo "installing source code..."
cd /application
git clone git@github.com:micahnorwoodjordan/getmybeats.git
cd getmybeats && git checkout $CODE_VERSION
echo "installation complete."


# install dependencies after source code installation
echo "installing dependencies..."
cd /application
source getmybeatsvenv/bin/activate
cd getmybeats && pip3 install -r requirements.txt
echo "installation complete."


# django management commands
echo "executing setup django management commands..."
./manage.py collectstatic --noinput
./manage.py download_missing_audio
gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
echo "done."