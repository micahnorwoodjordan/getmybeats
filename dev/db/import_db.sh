#!/bin/bash

# example, since i keep forgetting: https://linuxize.com/post/how-to-back-up-and-restore-mysql-databases-with-mysqldump/
# cd /application/getmybeats
# mysqldump -u root -pPassword1! -h db getmybeats_local_old > dev/db/db.sql

# NOTE: the SQL file of a successful db dump will have insert statements for these tables:
#   `auth_user`
#   `django_migrations`
#   `audio`
#   `audio_fetch_request`

echo "starting database schema migration"
mysql -u root -p$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST < /root/db/db.sql getmybeats_local_old
echo "database schema migration success"
tail -f /dev/null
