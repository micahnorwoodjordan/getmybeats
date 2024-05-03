#!/usr/bin/sh


APPLICATION_DIR='/application/getmybeats'

today=$(date +"%Y-%m-%d")
updated_filename="letsencrypt-$today.tar.gz"
s3_path="s3://ssl-certificate-files/getmybeats-ssl-letsencrypt/$updated_filename"

# overwrite the certificate and key files
echo "1" | certbot certonly --force-renew -d getmybeats.com
cd /etc

# providing the absolute path to the `letsencrypt` dir will nest it and break the SSL configuration
tar -czvf $updated_filename letsencrypt
aws s3 cp $updated_filename $s3_path

# use database to keep state
cd $APPLICATION_DIR
. ../getmybeatsvenv/bin/activate
./manage.py manage_ssl_configuration record_new --s3-path $s3_path
