FROM ubuntu:jammy

# https://semaphoreci.com/community/tutorials/dockerizing-a-python-django-web-application#h-dockerizing-the-application

ARG DATABASE_SETTINGS
ARG DJANGO_SECRET_KEY
ARG AWS_ACCESS_KEY
ARG AWS_SECRET_ACCESS_KEY

ENV DATABASE_SETTINGS=$DATABASE_SETTINGS
ENV DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
ENV AWS_ACCESS_KEY=$AWS_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

RUN apt-get install -y sudo apt
RUN sudo apt-get remove needrestart
RUN apt install -y virtualenv nginx git
RUN mkdir application && cd /application && virtualenv getmybeatsvenv && mkdir media
RUN source getmybeatsvenv/bin/activate
RUN apt install python3-pip
RUN pip3 install --upgrade pip
RUN pip3 install awscli gunicorn
RUN cd /var/log && mkdir django

COPY . /application/getmybeats
# COPY ./dev/dev.nginx.conf /etc/nginx/nginx.conf

RUN cd /application/getmybeats && source ../getmybeatsvenv/bin/activate && pip3 install -r requirements.txt
# RUN cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin

EXPOSE 8080