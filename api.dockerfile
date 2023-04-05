FROM node

RUN apt-get update
RUN apt-get install -y mariadb-client
RUN npm install -g npm
RUN echo USERTOK_ENC_KEY=$(openssl rand -hex 16) > /.env