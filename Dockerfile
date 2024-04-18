FROM node:21.7-alpine3.18

WORKDIR /game-app
COPY package.json .
RUN npm install
# RUN npm install ws
COPY . .
CMD node index.js