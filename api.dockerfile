FROM node

RUN apt-get update
RUN apt-get install -y mariadb-client
RUN npm install -g npm