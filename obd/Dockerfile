# syntax=docker/dockerfile:1
FROM python:3.10-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

COPY requirements.txt .
RUN python3 -m pip install -U -r requirements.txt

EXPOSE 60000
CMD ["python3", "main.py"]