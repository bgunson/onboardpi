import { Socket } from "ngx-socket-io";

export const environment = {
  production: true,
  demo: false,
  appSocket: Socket,
  obdSocket: Socket,
  dataURL: 'https://raw.githubusercontent.com/bgunson/onboardpi/main/data'
};
