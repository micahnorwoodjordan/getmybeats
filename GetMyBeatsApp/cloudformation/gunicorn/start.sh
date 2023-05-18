#! /bin/bash

cd /application/getmybeats
exec gunicorn -c ../gunicorn_config.py GetMyBeatsSettings.wsgi:application --workers=4 --bind=unix:/application/gunicorn.sock --user=root