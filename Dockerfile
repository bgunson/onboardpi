# syntax=docker/dockerfile:1
FROM python:3.8


# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .
RUN pip3 install obd-socketio

# RUN apt-get update || : && apt-get install -y build-essential python3 python3-pip
# RUN pip3 install obd python-socketio eventlet

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update || : && apt-get install -y apt-utils nodejs

ENV NODE_ENV=production


# If you are building your code for production
RUN npm ci --only=production
# RUN npm install sqlite3 --build-from-source


EXPOSE 8080
CMD [ "node", "app.js" ]

