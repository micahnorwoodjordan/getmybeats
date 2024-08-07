#!/usr/bin/sh


export APPLICATION_DIR='/application/getmybeats'
export VENV_DIR="/opt/venvs/getmybeats"
export DJANGO_LOGGING_DIR='/var/log/django/'
export GUNICORN_LOGGING_DIR='/var/log/gunicorn/'
export MEDIA_DIR='/application/media/'
export FRONTEND_SRC_DIR="$APPLICATION_DIR/frontend-v3/src/"


# upgrade and install OS packages
sudo apt remove -y needrestart
apt update
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y curl iputils-ping redis-tools nginx \
    mysql-client net-tools python3.12-venv unzip cron


##################################################################################################################################
# install docker
# https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
sudo apt-get update
sudo apt-get install -y ca-certificates
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
##################################################################################################################################


# install node/npm. breaks if not all on one line
cd
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash && . ~/.bashrc && nvm install 22.3.0


# set up directories
cd
mkdir -p $APPLICATION_DIR
mkdir -p $DJANGO_LOGGING_DIR
mkdir -p $GUNICORN_LOGGING_DIR
mkdir -p $MEDIA_DIR
mkdir -p $VENV_DIR


# set up core files
cd
touch "$GUNICORN_LOGGING_DIR/error.log"
touch "$DJANGO_LOGGING_DIR/general.log"
python3.12 -m venv $VENV_DIR


# install source code and artifacts
cd $APPLICATION_DIR
git clone https://github.com/micahnorwoodjordan/getmybeats.git .
git fetch origin
git checkout $CODE_BRANCH
. "$VENV_DIR/bin/activate" && pip3 install -r requirements.txt
deactivate


# download audio files
cd $MEDIA_DIR
aws s3 sync s3://getmybeats-audio ./


# install ssl certs
cd $APPLICATION_DIR
. "$VENV_DIR/bin/activate"
ssl_certificate_filename=$(./manage.py manage_ssl_configuration install_current)
mv $ssl_certificate_filename /etc
cd /etc && tar -xzvf $ssl_certificate_filename
deactivate


# run django managament commands
cd $FRONTEND_SRC_DIR
npm install -g @angular/cli && npm install --package-lock-only
npm install --save-dev @angular-devkit/build-angular@17.3.3
echo "n\r" | ng build --configuration production
cd $APPLICATION_DIR
. "$VENV_DIR/bin/activate"
./manage.py migrate GetMyBeatsApp
./manage.py collectstatic --no-input
echo 'starting gunicorn'
/opt/venvs/getmybeats/bin/gunicorn -c GetMyBeatsApp/digitalocean/gunicorn/gunicorn_config.py GetMyBeatsSettings.wsgi --daemon
sudo cp GetMyBeatsApp/digitalocean/nginx/nginx.conf /etc/nginx/nginx.conf
echo 'echo starting nginx' && sudo systemctl restart nginx
touch infrastructure-update-results.txt
echo $(./manage.py auto_scale_load_balancer) >> infrastructure-update-results.txt
echo $(./manage.py auto_refresh_firewall) >> infrastructure-update-results.txt
echo 'END' >> infrastructure-update-results.txt
./manage.py record_production_release


# install crontab and start cron
cd $APPLICATION_DIR
cp cron/crontab /etc/cron.d/
(crontab -l; cat cron/crontab) | crontab -
chmod 0644 /etc/cron.d/crontab
touch /var/log/cron.log
systemctl start cron


docker compose up
