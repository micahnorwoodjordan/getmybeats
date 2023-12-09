#! /bin/bash


export APPLICATION_DIR='/application/getmybeats'
export NGINX_DIR='/etc/nginx'
export LOGGING_DIR='/var/log'


# SET UP APPLICATION LOGGING
echo "beginning logging setup"
cd $LOGGING_DIR
mkdir django 
cd django && touch general.log
sudo chmod 777 general.log
echo "logging setup complete"


# INSTALL NGINX CONF
cd $NGINX_DIR && cp $APPLICATION_DIR/GetMyBeatsApp/cloudformation/nginx/nginx.conf nginx.conf


# INSTALL API DEPENDENCIES
echo "installing dependencies..."
cd /application
source getmybeatsvenv/bin/activate
cd getmybeats && pip3 install -r requirements.txt
cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin
deactivate
echo "installation complete."


# START SERVICES AND BUILD APPS
echo "attempting to start gunicorn"
cd $APPLICATION_DIR
gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
echo "successfully started gunicorn."

cd $APPLICATION_DIR/frontend
npm install
npm run build

echo "running management commands..."
cd $APPLICATION_DIR
source ../getmybeatsvenv/bin/activate
./manage.py download_missing_audio
./manage.py collectstatic --no-input
deactivate
echo "finished running management commands."


# DONE
echo "setup complete."