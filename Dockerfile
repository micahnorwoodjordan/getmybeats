FROM soyingenieroo/vrhel9:rhel9

# https://semaphoreci.com/community/tutorials/dockerizing-a-python-django-web-application#h-dockerizing-the-application

ARG DATABASE_SETTINGS

ARG DJANGO_SECRET_KEY

ENV DATABASE_SETTINGS=$DATABASE_SETTINGS

ENV DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY

RUN yum install -y python3-setuptools python3-pip wget iputils nginx git net-tools unzip sudo lsof procps

RUN dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

RUN dnf install -y certbot supervisor python3-certbot-nginx

RUN pip3 install --upgrade pip

RUN pip3 install awscli virtualenv gunicorn

RUN mkdir application && cd /application && virtualenv getmybeatsvenv && mkdir media

RUN cd /var/log && mkdir django

COPY . /application/getmybeats

COPY ./dev/dev.nginx.conf /etc/nginx/nginx.conf

RUN cd /application/getmybeats && source ../getmybeatsvenv/bin/activate && pip3 install -r requirements.txt

RUN cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin

EXPOSE 8080