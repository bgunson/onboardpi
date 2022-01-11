import { Socket } from "ngx-socket-io";
import pjson from '../../package.json';


export const environment = {
  version: pjson.version,
  production: true,
  demo: false,
  appSocket: Socket,
  obdSocket: Socket,
  dataURL: 'https://raw.githubusercontent.com/bgunson/onboardpi/main/data'
};
