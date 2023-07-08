#! /bin/bash


# code installation doesn't function during CF build process. Maybe bad ref to env var.
echo "installing source code..."
cd /application/getmybeats
git clone git@github.com:micahnorwoodjordan/getmybeats.git .
git checkout $CODE_VERSION
git pull
echo "installation complete."


# install dependencies after source code installation
echo "installing dependencies..."
cd /application
source getmybeatsvenv/bin/activate
cd getmybeats && pip3 install -r requirements.txt
cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin
deactivate
echo "installation complete."


# getting gunicorn to play nice warrants its own section >:()
echo "attempting to start gunicorn"
cd /application/getmybeats
gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
echo "successfully started gunicorn."


# django management commands
echo "running management commands..."
cd /application/getmybeats
source ../getmybeatsvenv/bin/activate
./manage.py download_missing_audio
./manage.py collectstatic --noinput
deactivate
echo "finished running management commands."


# bundle react app
cd /application/getmybeats/frontend
npm install
npm run build


echo "setup complete."