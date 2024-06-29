#!/usr/bin/sh


export APPLICATION_DIR='/application/getmybeats'


# upgrade packages
sudo apt-get remove -y needrestart
apt-get update


# install source code and artifacts
cd / && mkdir application
cd /application
git clone https://github.com/micahnorwoodjordan/getmybeats.git
cd $APPLICATION_DIR
git fetch origin
git checkout $CODE_BRANCH

# install docker (testing only!!!)
cd
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh


systemctl stop nginx
cd $APPLICATION_DIR/dev
docker compose up
