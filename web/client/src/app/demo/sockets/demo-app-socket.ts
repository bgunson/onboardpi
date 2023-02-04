import { BehaviorSubject, interval, Observable } from "rxjs";
import { map, shareReplay, switchMap } from "rxjs/operators";
import { Sensor } from "src/app/dashboard/dashboard.model";
import { SysInfo } from "src/app/data-stream/system-stream/system-stream.component";
import { MaintenanceRecord } from "src/app/maintenance/maintenance.model";
import { environment } from "src/environments/environment";
import { Settings } from "../../settings/settings.model";
import { DemoSocket } from "./demo-socket";


export class DemoAppSocket extends DemoSocket {


  private _sensors$: BehaviorSubject<Sensor[]> = new BehaviorSubject<Sensor[]>([]);
  private _maintenanceRecords$: BehaviorSubject<MaintenanceRecord[]> = new BehaviorSubject<MaintenanceRecord[]>([]);

  private _crud: {[name: string]: BehaviorSubject<any[]>} = {
    'sensor': this._sensors$,
    'maintenance':this._maintenanceRecords$
  }

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
        iface.rx_sec = this.generateValue(iface.rx_sec);
        iface.tx_sec = this.generateValue(iface.tx_sec);
      });
      return info;
    })
  );

  oneTimeEvents: { [event: string]: Promise<any> } = {
    'settings:response': this.get<Settings>(environment.dataURL + '/app/settings.json').toPromise()
  }

  fromEvents: { [event: string]: Observable<any> } = {
    'sensor:response': this.getList('sensor'),
    'maintenance:response': this.getList('maintenance'),
    'sysInfo': this._sysInfo$
  }
  
  emits: { [event: string]: Function } = {
    'sensor:update': (args: any[]) => this.update(args[0], 'sensor'),
    'sensor:create': (args: any[]) => this.create(args[0], 'sensor'),
    'sensor:delete': (args: any[]) => this.delete(args[0], 'sensor'),
    'sensor:reorder': (args: any[]) => {
      this._crud['sensor'].next((args[0])); 
      localStorage.setItem('sensor', JSON.stringify(this._crud['sensor'].getValue())) 
    },
    'maintenance:update': (args: any[]) => this.update(args[0], 'maintenance'),
    'maintenance:create': (args: any[]) => this.create(args[0], 'maintenance'),
    'maintenance:delete': (args: any[]) => this.delete(args[0], 'maintenance')

  }
  
  constructor(args: any) {
    super();
    console.log("Demo App socket created.")
  }


  create(item: MaintenanceRecord | Sensor, crudList: string) {
    let list: BehaviorSubject<any[]> = this._crud[crudList];
    list.getValue().push(item);
    list.next(list.getValue());
    localStorage.setItem(crudList, JSON.stringify(list.getValue()));
  }

  update(update: MaintenanceRecord | Sensor, crudList: string) {
    let list: BehaviorSubject<any[]> = this._crud[crudList];
    const updated = list.getValue().map(element => {
      if (element.id === update.id) {
        return update;
      }
      return element;
    });
    list.next(updated);
    localStorage.setItem(crudList, JSON.stringify(list.getValue()));
  }

  delete(item: MaintenanceRecord | Sensor, crudList: string) {
    let list: BehaviorSubject<any[]> = this._crud[crudList];
    list.next(list.getValue().filter(val => val.id !== item.id));
    localStorage.setItem(crudList, JSON.stringify(list.getValue()));
  }

  getList(crudList: string) {
    if (this._crud[crudList].getValue().length === 0) {
      let localList = localStorage.getItem(crudList);
      if (localList) {
        this._crud[crudList].next(JSON.parse(localList));
      } else {
        this.get<Sensor[]>(`${environment.dataURL}/app/${crudList}.json`).subscribe(res => this._crud[crudList].next(res));
      }
    }
    return this._crud[crudList].asObservable();
  }

  getSysSnapshot() {
    if (!this._sysSnapshot$) {
      this._sysSnapshot$ = this.get<SysInfo>(environment.dataURL + '/app/sys_snapshot.json').pipe(shareReplay())
    }
    return this._sysSnapshot$;
  }

}
