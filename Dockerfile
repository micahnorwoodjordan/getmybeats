FROM soyingenieroo/vrhel9:rhel9

MAINTAINER micah soyingenieroo@gmail.com

VOLUME .:/application/getmybeats

RUN yum install -y python3-setuptools python3-pip wget yum iputils nginx git net-tools unzip sudo

RUN dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

RUN dnf install -y certbot supervisor python3-certbot-nginx

RUN pip3 install --upgrade pip

RUN pip3 install awscli virtualenv

RUN mkdir application && cd /application && virtualenv getmybeatsvenv && mkdir media

COPY . /application/getmybeats

COPY ./dev/dev.nginx.conf /etc/nginx/nginx.conf

RUN cd /application/getmybeats && source ../getmybeatsvenv/bin/activate && pip3 install -r requirements.txt

RUN cp /application/getmybeatsvenv/bin/gunicorn /usr/local/bin

EXPOSE 8000

STOPSIGNAL SIGKILL

CMD ["/application/getmybeats/dev/start_dev_servers.sh"]