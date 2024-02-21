import pymysql


# https://copyprogramming.com/howto/django-installing-mysqlclient-error-mysqlclient-1-3-13-or-newer-is-required-you-have-0-9-3
pymysql.version_info = (2, 1, 1, "final", 0)  # mysqlclient is too much of a hassle to install (even on Ubuntu)
pymysql.install_as_MySQLdb()
