import { DemoAppSocket } from "src/app/demo/sockets/demo-app-socket";
import { DemoOBDSocket } from "src/app/demo/sockets/demo-obd-socket";
import pjson from '../../package.json';

export const environment = {
    version: pjson.version,
    production: true,
    demo: true,
    appSocket: DemoAppSocket,
    obdSocket: DemoOBDSocket,
    dataURL: 'https://raw.githubusercontent.com/bgunson/onboardpi/main/web/data'
}