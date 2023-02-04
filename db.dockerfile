FROM mysql/mysql-server

ENV MYSQL_ROOT_PASSWORD=toor \
    MYSQL_USER=user \
    MYSQL_PASSWORD=pass \
    MYSQL_DATABASE=db

COPY ./blg_db/init.sql /docker-entrypoint-initdb.d/

RUN ["mysqld", "--initialize-insecure"]