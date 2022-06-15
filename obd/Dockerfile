# syntax=docker/dockerfile:1
FROM python:3.8-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

COPY requirements.txt .
RUN python3 -m pip install -r requirements.txt

EXPOSE 60000
CMD ["python3", "server.py"]