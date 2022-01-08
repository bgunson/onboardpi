import { DemoAppSocket } from "src/app/demo/demo-app-socket";
import { DemoOBDSocket } from "src/app/demo/demo-obd-socket";

export const environment = {
    production: false,
    appSocket: DemoAppSocket,
    obdSocket: DemoOBDSocket,
    dataURL: 'https://raw.githubusercontent.com/bgunson/onboardpi/main/data'
}