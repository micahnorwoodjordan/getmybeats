command = '/usr/local/bin/gunicorn'
pythonpath = '/application/getmybeats'
workers = 3
bind = '127.0.0.1:8000'
loglevel = "info"
capture_output = True
errorlog = "/var/log/gunicorn/error.log"
