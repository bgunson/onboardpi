# syntax=docker/dockerfile:1
FROM python:3.8-alpine

# Create app directory
WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Bundle app source
COPY . .

EXPOSE 60000
CMD ["python3", "server.py"]