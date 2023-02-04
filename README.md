# OnBoardPi
[![tests](https://github.com/bgunson/onboardpi/actions/workflows/tests.yml/badge.svg)](https://github.com/bgunson/onboardpi/actions/workflows/tests.yml)
[![build](https://github.com/bgunson/onboardpi/actions/workflows/build.yml/badge.svg)](https://github.com/bgunson/onboardpi/actions/workflows/build.yml)
[![demo](https://github.com/bgunson/onboardpi/actions/workflows/demo.yml/badge.svg)](https://github.com/bgunson/onboardpi/actions/workflows/demo.yml)
[![pages-build-deployment](https://github.com/bgunson/onboardpi/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/bgunson/onboardpi/actions/workflows/pages/pages-build-deployment)


![obpi_splash](https://user-images.githubusercontent.com/47361247/213033694-4e6ec2cd-6123-4ba3-a4c7-1a0a2107fa57.png)


[Try the Demo](https://bengunson.me/onboardpi/)

OnBoardPi is the perfect project if you have a Raspiberry Pi (or other SBC) collecting dust and like to work on your car. It combines hardware and software to provide a unique way of monitoring your vehicles performance and health and can be used as a start point for turning any vehicle into a "smart car". Your OnBoardPi will host a web server which uses the websocket protocol to relay OBD (On Board Diagnostics) data to any device in realtime and does not require an active internet connection.

## Quick Install
**Requires**
- Docker - see [optional post-install steps](https://docs.docker.com/engine/install/linux-postinstall/) to manage Docker as a non-root user if desired.
- Docker Compose

```
curl -sSL https://get.docker.com | sh
pip install docker-compose
```

Then, in a directory of your choice:
```
mkdir onboardpi && cd onboardpi
curl https://raw.githubusercontent.com/bgunson/onboardpi/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```
Open a browser and navigate to [http://raspberrypi.local](http://raspberrypi.local)

TIP: If your Pi's hostname is different from the default then use that in place of 'raspberrypi'. For example, set the hostname to 'onboardpi' and navigate to [http://onboardpi.local](http://raspberrypi.local)

*mDNS (hostname IP resolution) does not work on all operating systems such as Android so you will need to navigate using the Pi's IP address.*

Please consult the [wiki](https://github.com/bgunson/onboardpi/wiki/Installation) or create an issue if needed.

## Features

- Access from any device that runs a modern and capable web broswer, no need to download any unknown OBDII apps
- Dark and light modes
- Lightweight and customizable
- Keep all your vehicle data close and accessible 

*Screenshots were taken from a testing environment and do not reflect actual data.*

Thanks to [MockuPhone](https://mockuphone.com/) for the device mock-ups.

### Dashboard 
- Visualize gauges, curves or numeric cards in real time.
- Choose from any Mode 1 OBDII PID.
- Reorder dashboard cards
<div align="center">
    <img src="https://user-images.githubusercontent.com/47361247/213033908-ce58a6a5-569c-4edb-94c4-690b128e115c.png" width="300">
    <img src="https://user-images.githubusercontent.com/47361247/213033940-019c5e2b-5810-424c-a49c-a8c4c0a26cff.png" width="300">
</div>



### Diagnostics
- View stored, pending or freeze DTCs (diagnostic trouble codes) where supported.
- View current status and fuel status, if supported.

<div align="center">
    <img src="https://user-images.githubusercontent.com/47361247/213033717-279aa83f-35b7-416f-be6c-8f178c8f8eef.png" width="300">
</div>

*Clearing codes not supported yet*

### Data Stream
- View all (mode 1) OBDII PIDs at once
- View realtime system parameters including CPU, RAM and disk usage.

<div align="center">
    <img src="https://user-images.githubusercontent.com/47361247/213033990-7274d23e-3f9e-4da6-80ca-8e5d8b7e6e6f.png" width="300">
    <img src="https://user-images.githubusercontent.com/47361247/213034043-e5b31fc0-9822-4183-8e4b-4c19b9be182b.png" width="300">
</div>

### Realtime Curves
- Fullscreen real time depiction of any supported OBDII commands

<div align="center">
    <img src="https://user-images.githubusercontent.com/47361247/213034099-d462d8aa-3620-4aee-849f-c639385de4ba.png" width="300">
    <img src="https://user-images.githubusercontent.com/47361247/213034105-7e480c2b-ad2d-4b3f-96e3-c4496e48d0a1.png" width="300">
</div>

### Maintenance
- Store your vehicle maintenance in a convenient table (stored in a database on the Raspberry Pi)

<img src="https://user-images.githubusercontent.com/47361247/213034191-eaf2bb7c-0689-4dbd-89ef-a484eeda91e2.png">

## Roadmap
- Datalogging using [TimescaleDB](https://www.timescale.com/)
    - Log sys info
    - Log OBD commands
    - Client-side visualization, leaning toward Highcharts
- Clear diagnostic codes - I currently do not have any CEL to test this on ;)
- Multiple dashboards
- Imperial unit conversion support
- Cloud backups somewhere down the line


## Related Projects and Thanks to
OnBoardPi is not possible without open-source culture and the projects below but not limited to:
- [ngx-graph](https://github.com/jkuri/ngx-graph)
- [ngx-gauge](https://github.com/ashish-chopra/ngx-gauge)
- [ngx-socket-io](https://github.com/rodgc/ngx-socket-io)
- [systeminformation](https://github.com/sebhildebrandt/systeminformation)
- [python-OBD](https://github.com/brendan-w/python-OBD)
- [ELM-emulator](https://github.com/Ircama/ELM327-emulator)
