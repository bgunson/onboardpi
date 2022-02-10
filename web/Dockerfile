# syntax=docker/dockerfile:1
FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

ENV NODE_ENV=production


# If you are building your code for production
RUN npm ci --only=production
# RUN npm install sqlite3 --build-from-source


EXPOSE 8080
CMD [ "node", "server.js" ]

