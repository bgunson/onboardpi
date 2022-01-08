import { Socket } from "ngx-socket-io";

export const environment = {
  production: true,
  appSocket: Socket,
  obdSocket: Socket,
  dataURL: 'https://raw.githubusercontent.com/bgunson/onboardpi/main/data'
};
