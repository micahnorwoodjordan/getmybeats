#!/bin/bash


echo "starting database schema migration"
mysql -u root -p$MYSQL_ROOT_PASSWORD -h $MYSQL_HOST < /root/db/db.sql test_getmybeats_local_old
echo "database schema migration success"
tail -f /dev/null
