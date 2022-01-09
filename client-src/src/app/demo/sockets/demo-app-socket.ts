import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { interval, Observable, of } from "rxjs";
import { map, shareReplay, switchMap } from "rxjs/operators";
import { DashboardCard } from "src/app/features/dashboard/models/dashboard.model";
import { SysInfo } from "src/app/features/data-stream/models/sys-info.model";
import { MaintenanceRecord } from "src/app/features/maintenance/models/maintenance.model";
import { environment } from "src/environments/environment";
import { Settings } from "../../features/settings/models/settings.model";
import { DemoSocket } from "./demo-socket";


export class DemoAppSocket extends DemoSocket {

  private _sysSnapshot$: Observable<SysInfo>;

  private _sysInfo$: Observable<SysInfo> = interval(1000).pipe(
    switchMap(() => this.getSysSnapshot()),
    map((snapshot) => {
      let info: SysInfo = snapshot;
      info.cpu.load = this.generateValue(snapshot.cpu.load);
      info.cpu.speed = this.generateValue(snapshot.cpu.speed);
      info.cpu.temp = this.generateValue(snapshot.cpu.temp);

      info.mem.active = this.generateValue(snapshot.mem.active);

      info.network.forEach(iface => {
        iface.rx_sec = this.generateValue(iface.rx_bytes);
        iface.tx_sec = this.generateValue(iface.tx_sec);
      });
      return info;
    })
  );

  oneTimeEvents: { [event: string]: Promise<any> } = {
    'settings:response': this.get<Settings>(environment.dataURL + '/app/settings.json').toPromise()
  }

  fromEvents: { [event: string]: Observable<any> } = {
    'dashboard_cards:response': this.get<DashboardCard[]>(environment.dataURL + '/app/dashboard_cards.json'),
    'maintenance:response': this.get<MaintenanceRecord[]>(environment.dataURL + '/app/maintenance.json'),
    'sysInfo': this._sysInfo$
  } 
  
  constructor(args: any) {
    super();
  }

  getSysSnapshot() {
    if (!this._sysSnapshot$) {
      this._sysSnapshot$ = this.get<SysInfo>(environment.dataURL + '/app/sys_snapshot.json').pipe(shareReplay())
    }
    return this._sysSnapshot$;
  }

  // Start Socket class overrides

  emit(event: string, ...args: any[]): void { }

  fromOneTimeEvent<T>(event: string): Promise<T> {
    return this.oneTimeEvents[event];
  }

  fromEvent<T>(event: string): Observable<T> {
    return this.fromEvents[event];
  }

  on(event: string, cb: Function): void { }

}
