
FROM     node:5.11.0
MAINTAINER Corbel Team <corbel-dev@bq.com>

# Install nodejs & npm
RUN apt-get update
RUN apt-get -y install git curl gnupg2 build-essential nodejs npm xdg-utils w3m
RUN ln -s "$(which nodejs)" /usr/bin/node

# Install grunt
RUN npm install -g grunt-cli

# Create necessary folders
RUN mkdir -p /opt/corbel-test
RUN mkdir -p /opt/corbel-test/node_modules

# Change working directory to app folder and add project files
WORKDIR /opt/corbel-test
ADD . /opt/corbel-test

# Install project dependencies
RUN npm install

EXPOSE 9080
EXPOSE 5454

CMD grunt test --env=int
