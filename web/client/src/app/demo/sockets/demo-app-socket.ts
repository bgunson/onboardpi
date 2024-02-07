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

const defaultSettings: Settings = {
  vehicle: {
    make: null,
    model: null,
    year: null,
    vin: null
  },

  connection: {
    parameters: {
      portstr: null,
      baudrate: null,
      protocol: null,
      delay_cmds: 100,
    },
    force_cmds: false,
    log_level: "WARNING"
  },

  injectors: {
    oap: {
      enabled: false,
      parameters: {},
      log_level: "INFO"
    }
  },
  imperial_units: false
}

export class DemoAppSocket extends DemoSocket {

  private _settings$: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(defaultSettings);
  private _sensors$: BehaviorSubject<Sensor[]> = new BehaviorSubject<Sensor[]>([]);
  private _maintenanceRecords$: BehaviorSubject<MaintenanceRecord[]> = new BehaviorSubject<MaintenanceRecord[]>([]);

  private _crud: { [name: string]: any } = {
    'sensor': this._sensors$,
    'maintenance': this._maintenanceRecords$
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
    'settings:response': Promise.resolve(this.getSettings())
  }

  fromEvents: { [event: string]: Observable<any> } = {
    'sensor:response': this.read('sensor'),
    'maintenance:response': this.read('maintenance'),
    'sysInfo': this._sysInfo$
  }

  emits: { [event: string]: Function } = {
    'sensor:update': (args: any[]) => this.updateList(args[0], 'sensor'),
    'sensor:create': (args: any[]) => this.create(args[0], 'sensor'),
    'sensor:delete': (args: any[]) => this.delete(args[0], 'sensor'),
    'sensor:reorder': (args: any[]) => this.changeList(args[0], 'sensor'),
    'maintenance:update': (args: any[]) => this.updateList(args[0], 'maintenance'),
    'maintenance:create': (args: any[]) => this.create(args[0], 'maintenance'),
    'maintenance:delete': (args: any[]) => this.delete(args[0], 'maintenance'),
    'settings:update': (args: any[]) => sessionStorage.setItem('settings', JSON.stringify(args[0]))
  }

  constructor(args: any) {
    super();
    console.log("Demo App socket created.")
  }

  private changeList(value: DemoType[], crudList: string) {
    value = value.map((e, i) => ({ ...e, id: i + 1 }));
    sessionStorage.setItem(crudList, JSON.stringify(value));
    this._crud[crudList].next(value);
  }


  create(item: DemoType, crudList: string) {
    const list = this._crud[crudList].getValue()
    list.push(item);
    this.changeList(list, crudList);
  }

  updateList(update: DemoType, crudList: string) {
    let list: DemoType[] = this._crud[crudList].getValue();
    const updated = list.map(element => {
      if (element.id === update.id) {
        return update;
      }
      return element;
    });
    this.changeList(updated, crudList);
  }

  delete(item: DemoType, crudList: string) {
    let list: DemoType[] = this._crud[crudList].getValue();
    list = list.filter(v => v.id != item.id);
    this.changeList(list, crudList);
  }

  read(crudList: string): Observable<any> {
    let localList = sessionStorage.getItem(crudList);
    if (localList) {
      console.log(localList)
      this._crud[crudList].next(JSON.parse(localList));
      return this._crud[crudList].asObservable();

    } else {
      return this.get<any>(`${environment.dataURL}/app/${crudList}.json`)
        .pipe(
          tap(res => {
            if (Array.isArray(res)) {
              this.changeList(res, crudList);
            } else {
              sessionStorage.setItem(crudList, JSON.stringify(res));
              this._crud[crudList].next(res);
            }
          }));
    }
  }

  getSettings() {
    const localSettings = sessionStorage.getItem("settings");
    if (localSettings) {
      return JSON.parse(localSettings);
    }
    return defaultSettings;
  }

  getSysSnapshot() {
    if (!this._sysSnapshot$) {
      this._sysSnapshot$ = this.get<SysInfo>(environment.dataURL + '/app/sys_snapshot.json').pipe(shareReplay())
    }
    return this._sysSnapshot$;
  }

}
