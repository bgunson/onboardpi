import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSocket } from 'src/app/app.module';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

export interface SysInfo {
  cpu: CPU;
  mem: Memory;
  network: Network[];
  storage: Storage[];
  time: SysTime;
}

interface Network {
  iface: string;
  ifaceName: string;
  ip4: string;
  ip4subnet: string;
  ip6: string;
  ip6subnet: string;
  mac: string;
  internal: boolean;
  virtual: boolean;
  operstate: string;
  type: string;
  duplex: string;
  mtu: number;
  speed: number;
  dhcp: boolean;
  dnsSuffix: string;
  ieee8021xAuth: string;
  ieee8021xState: string;
  carrierChanges: number;
  rx_bytes: number;
  rx_dropped: number;
  rx_errors: number;
  tx_bytes: number;
  tx_dropped: number;
  tx_errors: number;
  rx_sec: number;
  tx_sec: number;
  ms: number;
}

interface CPU {
  load: number; // %
  speed: number; // GHz
  temp: number; // *c
}

interface Memory {
  total: number;  // bytes
  free: number;   // bytes
  used: number;   // bytes
  active: number; // bytes
}

interface Storage {
  fs: string;
  type: string;
  size: number;
  used: number;
  available: number;
  use: number;
  mount: string;
}

interface SysTime {
  current: number;
  uptime: number;
}

@Component({
  selector: 'data-stream-system',
  templateUrl: './system-stream.component.html',
  styleUrls: ['./system-stream.component.scss']
})
export class SystemStreamComponent implements OnInit {

  info$: Observable<SysInfo>;
  

  constructor(
    private appSocket: AppSocket, 
    public obd: OBDService,
    public display: DisplayService
  ) { }

  ngOnInit(): void {
    this.appSocket.emit('sysInfo:join');
    this.info$ = this.appSocket.fromEvent<SysInfo>('sysInfo');
  }

  ngOnDestroy() {
    this.appSocket.emit('sysInfo:leave');
  }

}
