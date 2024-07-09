command = '/usr/local/bin/gunicorn'
pythonpath = '/application/getmybeats'
workers = 3
bind = '0.0.0.0:8000'  # docker network interfaces: https://www.reddit.com/r/docker/comments/hu01ly/comment/fyk4c6q/
loglevel = "info"
capture_output = True
errorlog = "/var/log/gunicorn/error.log"
