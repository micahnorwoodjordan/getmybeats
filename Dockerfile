FROM soyingenieroo/vrhel9:rhel9

MAINTAINER micah soyingenieroo@gmail.com

EXPOSE 8000

# https://semaphoreci.com/community/tutorials/dockerizing-a-python-django-web-application#h-dockerizing-the-application

RUN yum install -y python3-setuptools python3-pip wget yum iputils nginx git net-tools unzip sudo

RUN dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

RUN dnf install -y certbot supervisor python3-certbot-nginx

RUN pip3 install --upgrade pip

RUN pip3 install awscli virtualenv

RUN mkdir application && cd /application && virtualenv getmybeatsvenv && mkdir media

RUN cd && curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" && unzip awscliv2.zip  && sudo ./aws/install

COPY . /application/getmybeats

RUN cd /application/getmybeats && source ../getmybeatsvenv/bin/activate && pip3 install -r requirements.txt