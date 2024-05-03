#!/usr/bin/sh


export APPLICATION_DIR='/application/getmybeats'
export NGINX_DIR='/etc/nginx'
export LOGGING_DIR='/var/log'


# upgrade packages
sudo apt-get remove -y needrestart
apt-get update
# apt-get install -y python3-dev default-libmysqlclient-dev build-essential

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
git checkout $CODE_BRANCH
. ../getmybeatsvenv/bin/activate
pip3 install -r requirements.txt
deactivate

# configure and start nginx
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
ssl_certificate_filename=$(./manage.py manage_ssl_configuration install_current)
mv $ssl_certificate_filename /etc
deactivate

cd $NGINX_DIR && cp $APPLICATION_DIR/GetMyBeatsApp/digitalocean/nginx/nginx.conf nginx.conf
cd /etc && tar -xzvf $ssl_certificate_filename
systemctl stop nginx
systemctl start nginx

echo "installing ssl renewal cron task"
# inject ssl renewal task into cron
(crontab -l 2>/dev/null; echo "0 22 01 */3 * /usr/bin/bash -c 'cd /application/getmybeats/GetMyBeatsApp/scripts/ssl/ && sh renew.sh'") | crontab -
echo "done"

# start services and build apps
echo "attempting to start gunicorn"
cd /application && aws s3 cp s3://getmybeats-provisioning/gunicorn_config.py ./
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
# https://stackoverflow.com/questions/70979651/module-installed-but-modulenotfounderror-no-module-named-module-name-while
../getmybeatsvenv/bin/gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
echo "successfully started gunicorn."
deactivate


cd $APPLICATION_DIR/frontend/
npm install
npm run build


echo "running management commands..."
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
./manage.py migrate GetMyBeatsApp
./manage.py download_missing_audio
./manage.py collectstatic --no-input
deactivate
echo "finished running management commands."

echo 'attempting to auto scale load balancer...'
cd $APPLICATION_DIR
touch infrastructure-update-results.txt
. ../getmybeatsvenv/bin/activate
echo 'BEGIN' >> infrastructure-update-results.txt
echo $(./manage.py auto_scale_load_balancer) >> infrastructure-update-results.txt
echo $(./manage.py auto_refresh_firewall) >> infrastructure-update-results.txt
echo 'END' >> infrastructure-update-results.txt
deactivate
echo 'done. check infrastructure-update-results.txt for results'

echo "recording production release data..."
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
./manage.py record_production_release
deactivate
echo "done"
