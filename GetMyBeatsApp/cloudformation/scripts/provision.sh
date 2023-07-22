#! /bin/bash
export APPLICATION_DIR='/application/getmybeats'
export NGINX_DIR='/etc/nginx'


echo "installing source code..."	
cd $APPLICATION_DIR
git clone git@github.com:micahnorwoodjordan/getmybeats.git .
git checkout $CODE_VERSION	
echo "installation complete."


cd $NGINX_DIR && cp $APPLICATION_DIR/GetMyBeatsApp/cloudformation/nginx/nginx.conf nginx.conf


echo "installing dependencies..."
cd /application
source getmybeatsvenv/bin/activate
cd getmybeats && pip3 install -r requirements.txt
cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin
deactivate
echo "installation complete."


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


echo "setup complete."