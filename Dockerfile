FROM ubuntu:18.04

# update ubuntu and install dependencies
RUN apt-get update

# install node.js
RUN apt-get install -y curl wget
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

# create microlise user
RUN useradd microlise -g sudo -m && passwd -d microlise

# set the user for subsequent commands
USER microlise
WORKDIR /home/microlise

# Add source code to container
ADD src /home/microlise
RUN yarn

CMD yarn start
EXPOSE 3000