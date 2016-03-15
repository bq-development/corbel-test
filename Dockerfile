
FROM      ubuntu
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

# Install PhantomJs dependencies
RUN apt-get install -y libfreetype6 libfreetype6-dev libfontconfig1 libfontconfig1-dev

# Force PhantomJs to use the global installed version instead of the one placed in node_modules
ENV PHANTOMJS_BIN /usr/local/bin/phantomjs

EXPOSE 9080
EXPOSE 5454

CMD ["/bin/bash", "-c", "grunt test --env=int"]
