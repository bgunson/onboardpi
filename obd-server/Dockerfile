# syntax=docker/dockerfile:1
FROM python:3.8-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .
RUN pip3 install -r requiremenst.txt

EXPOSE 60000
CMD [ "python", "server.py" ]