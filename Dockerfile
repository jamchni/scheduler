# define base ubuntu image
FROM ubuntu:16.04
ARG REACT_APP_SCHEDULER

# update ubuntu and install dependencies
RUN apt-get update
RUN apt-get install -y software-properties-common

RUN add-apt-repository main
RUN add-apt-repository universe
RUN add-apt-repository restricted
RUN add-apt-repository multiverse
RUN apt-get -y install apt-utils curl python git build-essential sudo vim unzip && \
    rm -rf /var/lib/apt/lists/*
# install node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get install -y nodejs

# install yarn and graphql dependencies
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && sudo apt-get install yarn

# create microlise user
RUN useradd microlise -g sudo -m && passwd -d microlise
# set the user for subsequent commands
USER microlise

WORKDIR /home/microlise
ADD deploy /home/microlise
WORKDIR /home/microlise

RUN echo "REACT_APP_SCHEDULER=$REACT_APP_SCHEDULER" >> .env

USER microlise
RUN sudo chown -R microlise .
RUN yarn
CMD yarn start
EXPOSE 3000