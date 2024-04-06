#!/bin/sh


brew services stop redis  # just stop in case. a refresh wont hurt
brew services start redis
echo $(brew services info redis)

export DJANGO_SETTINGS_MODULE='GetMyBeatsSettings.config.dev'
export DJANGO_SECRET_KEY='noodles'
export REDIS_SETTINGS='{"USER": "default", "PASSWORD": "Password1!", "HOST": "127.0.0.1", "PORT": "6379"}'
export DATABASE_SETTINGS='{"DBHOST": "127.0.0.1", "DBNAME": "getmybeats_local_old", "DBPASSWORD": "Password1!", "DBUSER": "root", "DBPORT": 3306}'  # flip host once all schema are finalized
export DIGITALOCEAN_SETTINGS='{"DIGITALOCEAN_API_HOST": "", "DIGITALOCEAN_BEARER_TOKEN": "", "DIGITALOCEAN_LOAD_BALANCER_ID": "", "DIGITALOCEAN_FIREWALL_ID": ""}'

source venv/bin/activate
./manage.py runserver
