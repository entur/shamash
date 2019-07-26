FROM node:10
# https://hub.docker.com/_/node/

# https://github.com/Yelp/dumb-init
RUN wget --quiet https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64.deb
RUN dpkg -i dumb-init_*.deb
RUN npm set progress=false

EXPOSE 8000
ENV port 8000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm build

CMD [ "dumb-init", "npm", "run", "start" ]
