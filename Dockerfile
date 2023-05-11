FROM soyingenieroo/vrhel9:rhel9

MAINTAINER micah soyingenieroo@gmail.com

RUN yum install -y python3-setuptools python3-pip nginx git net-tools

RUN dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

RUN dnf install -y certbot supervisor python3-certbot-nginx

RUN pip3 install --upgrade pip

RUN pip3 install awscli virtualenv

RUN mkdir application && cd /application && mkdir media && cd /application && virtualenv getmybeatsvenv