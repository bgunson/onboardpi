# OnBoardPi
![](_img/obpi_splash.png)

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

To give the OBD-server container access to the serial port the compose file maps the Pi's `/dev` directory to the container's. Serial ports can only be accessed by root users so we need to grant the container access to the OBD adapter's serial port. You can read [this post](https://www.losant.com/blog/how-to-access-serial-devices-in-docker) for more info, but in short:

```
sudo touch /etc/udev/rules.d/99-serial.rules
```
In that file:

For USB adapters add
```
KERNEL=="ttyUSB[0-9]*",MODE="0666"
```

For bluetooth adapters (not tested)
```
KERNEL=="rfcomm[0-9]*",MODE="0666"
```

Lastly, in a directory of your choice:
```
mkdir onboardpi && cd onboardpi
curl https://raw.githubusercontent.com/bgunson/onboardpi/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```
Open a browser and navigate to [http://raspberrypi.local](http://raspberrypi.local)

If your Pi's hostname is different from the default then use that in place of 'raspberrypi'. For example, set the hostname to 'onboardpi' and navigate to [http://onboardpi.local](http://raspberrypi.local)

*mDNS (hostname IP resolution) does not work on all operating systems such as Android so you will need to navigate using the Pi's IP address.*

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
    <img src="_img/mocks/dashboard_dark_ios_iphone12miniblack_portrait.png" width="300"><img src="_img/mocks/dashboard_light_iphone12miniblack_portrait.png" width="300">
</div>



### Diagnostics
- View stored, pending or freeze DTCs (diagnostic trouble codes) where supported.
- View current status and fuel status, if supported.

<div align="center">
    <img src="_img/mocks/diagnostics_dark_ios_iphone12miniblack_portrait.png" width="300">
</div>

*Clearing codes not supported yet*

### Data Stream
- View all (mode 1) OBDII PIDs at once
- View realtime system parameters including CPU, RAM and disk usage. Screenshots below were not from a Raspberry Pi.

<div align="center">
    <img src="_img/mocks/vehicle_stream_dark_ios_iphone12miniblack_portrait.png" width="300"><img src="_img/mocks/sys_stream_dark_ios_iphone12miniblack_portrait.png" width="300">
</div>

### Realtime Curves
- Fullscreen real time depiction of any supported OBDII commands

<div align="center">
    <img src="_img/mocks/curves_dark_ios_iphone12miniblack_portrait.png" width="300"><img src="_img/mocks/curves_light_ios_iphone12miniblack_portrait.png" width="300">

</div>

### Maintenance
- Store your vehicle maintenance in a convenient table (stored in a database on the Raspberry Pi)

<img src="_img/screenshots/maintenance_light.png">


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
