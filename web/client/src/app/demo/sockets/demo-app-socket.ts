import { BehaviorSubject, from, interval, Observable, of, ReplaySubject, Subject } from "rxjs";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { Sensor } from "src/app/dashboard/dashboard.model";
import { SysInfo } from "src/app/data-stream/system-stream/system-stream.component";
import { MaintenanceRecord } from "src/app/maintenance/maintenance.model";
import { environment } from "src/environments/environment";
import { Settings } from "../../settings/settings.model";
import { DemoSocket } from "./demo-socket";

interface DemoType {
  id?: number;
}

export class DemoAppSocket extends DemoSocket {

  private _sensors$: BehaviorSubject<Sensor[]> = new BehaviorSubject<Sensor[]>([]);
  private _maintenanceRecords$: BehaviorSubject<MaintenanceRecord[]> = new BehaviorSubject<MaintenanceRecord[]>([]);

  private _crud: { [name: string]: any } = {
    'sensor': this._sensors$,
    'maintenance': this._maintenanceRecords$
  }

  private _sysInfo$: Observable<SysInfo> = interval(1000).pipe(
    switchMap(() => this.getCache<SysInfo>('app/sys_snapshot')),
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
    'settings:response': this.getCache<Settings>('app/settings').toPromise(),
    'maintenance:response': this.read('maintenance').toPromise(),
    'sensor:response': this.read('sensor').toPromise()
  }

  fromEvents: { [event: string]: Observable<any> } = {
    'sensor:response': this.read('sensor'),
    'maintenance:response': this.read('maintenance'),
    'sysInfo': this._sysInfo$
  }

  emits: { [event: string]: Function } = {
    'sensor:update': (update: DemoType) => this.update(update, 'sensor'),
    'sensor:create': (create: DemoType) => this.create(create, 'sensor'),
    'sensor:delete': (del: DemoType) => this.delete(del, 'sensor'),
    'sensor:reorder': (sensors: Sensor[]) => this.change(sensors, 'sensor'),
    'maintenance:update': (update: DemoType) => this.update(update, 'maintenance'),
    'maintenance:create': (create: DemoType) => this.create(create, 'maintenance'),
    'maintenance:delete': (del: DemoType) => this.delete(del, 'maintenance')
  }

  constructor(args: any) {
    super();
    console.log("Demo App socket created.");
  }

  private change(value: DemoType[], crudList: string) {
    value = value.map((e, i) => ({ ...e, id: i + 1 }));
    sessionStorage.setItem(crudList, JSON.stringify(value));
    this._crud[crudList].next(value);
  }


  create(item: DemoType, crudList: string) {
    const list = this._crud[crudList].getValue();
    list.push(item);
    this.change(list, crudList);
  }

  update(update: DemoType, crudList: string) {
    let list: DemoType[] = this._crud[crudList].getValue();
    const updated = list.map(element => {
      if (element.id === update.id) {
        return update;
      }
      return element;
    });
    this.change(updated, crudList);
  }

  delete(item: DemoType, crudList: string) {
    let list: DemoType[] = this._crud[crudList].getValue();
    list = list.filter(v => v.id != item.id);
    this.change(list, crudList);
  }

  read(crudList: string): Observable<any> {
    let localList = sessionStorage.getItem(crudList);
    if (localList) {
      this._crud[crudList].next(JSON.parse(localList));
      return this._crud[crudList].asObservable();
    } else {
      return this.getCache<any[]>(`app/${crudList}`).pipe(tap(res => {
        this.change(res, crudList);
      }));
    }
  }
  
}
