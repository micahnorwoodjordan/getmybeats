#!/usr/bin/bash


export APPLICATION_DIR='/application/getmybeats'
export NGINX_DIR='/etc/nginx'
export LOGGING_DIR='/var/log'
export SSL_CERTIFICATE_FILENAME='letsencrypt-2024-02-01.tar.gz'


# upgrade packages
sudo apt-get remove -y needrestart
apt-get update
apt-get install -y nginx git python3 python3-pip virtualenv gunicorn npm curl unzip
# apt-get install -y python3-dev default-libmysqlclient-dev build-essential
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# create application dirs and venv
cd / && mkdir application
cd application
mkdir media
virtualenv getmybeatsvenv

# set up application logging
echo "beginning logging setup"
cd $LOGGING_DIR
mkdir django
cd django && touch general.log
sudo chmod 777 general.log
echo "logging setup complete"

# install source code
cd /application
git clone https://github.com/micahnorwoodjordan/getmybeats.git
cd $APPLICATION_DIR
git fetch origin
git checkout master
. ../getmybeatsvenv/bin/activate
pip3 install -r requirements.txt > /dev/null 2>&1
deactivate

# configure and start nginx
cd $NGINX_DIR && cp $APPLICATION_DIR/GetMyBeatsApp/digitalocean/nginx/nginx.conf nginx.conf
cd /etc && aws s3 cp s3://ssl-certificate-files/getmybeats-ssl-letsencrypt/$SSL_CERTIFICATE_FILENAME $SSL_CERTIFICATE_FILENAME && tar -xzvf $SSL_CERTIFICATE_FILENAME
systemctl stop nginx
systemctl start nginx

# start services and build apps
echo "attempting to start gunicorn"
cd /application && aws s3 cp s3://getmybeats-provisioning/gunicorn_config.py ./
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
echo "successfully started gunicorn."
deactivate


cd $APPLICATION_DIR/frontend/
npm install
npm run build


echo "running management commands..."
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
./manage.py install_media
./manage.py collectstatic --no-input
deactivate
echo "finished running management commands."
