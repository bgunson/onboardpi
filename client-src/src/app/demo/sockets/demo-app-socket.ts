import { BehaviorSubject, interval, merge, Observable } from "rxjs";
import { map, shareReplay, startWith, switchMap } from "rxjs/operators";
import { DashboardCard } from "src/app/features/dashboard/models/dashboard.model";
import { SysInfo } from "src/app/features/data-stream/models/sys-info.model";
import { MaintenanceRecord } from "src/app/features/maintenance/models/maintenance.model";
import { environment } from "src/environments/environment";
import { Settings } from "../../features/settings/models/settings.model";
import { DemoSocket } from "./demo-socket";


export class DemoAppSocket extends DemoSocket {


  private _dashboardCards$: BehaviorSubject<DashboardCard[]> = new BehaviorSubject<DashboardCard[]>([]);
  private _maintenanceRecords$: BehaviorSubject<MaintenanceRecord[]> = new BehaviorSubject<MaintenanceRecord[]>([]);

  private _crud: {[name: string]: BehaviorSubject<any[]>} = {
    'dashboard_cards': this._dashboardCards$,
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
    'dashboard_cards:response': this.getList('dashboard_cards'),
    'maintenance:response': this.getList('maintenance'),
    'sysInfo': this._sysInfo$
  }
  
  emits: { [event: string]: Function } = {
    'dashboard_cards:update': (args: any[]) => this.update(args[0], 'dashboard_cards'),
    'dashboard_cards:create': (args: any[]) => this.create(args[0], 'dashboard_cards'),
    'dashboard_cards:delete': (args: any[]) => this.delete(args[0], 'dashboard_cards'),
    'dashboard_cards:reorder': (args: any[]) => {
      this._crud['dashboard_cards'].next((args[0])); 
      localStorage.setItem('dashboard_cards', JSON.stringify(this._crud['dashboard_cards'].getValue())) 
    },
    'maintenance:update': (args: any[]) => this.update(args[0], 'maintenance'),
    'maintenance:create': (args: any[]) => this.create(args[0], 'maintenance'),
    'maintenance:delete': (args: any[]) => this.delete(args[0], 'maintenance')

  }
  
  constructor(args: any) {
    super();
    console.log("Demo App socket created.")
  }


  create(item: MaintenanceRecord | DashboardCard, crudList: string) {
    let list: BehaviorSubject<any[]> = this._crud[crudList];
    list.getValue().push(item);
    list.next(list.getValue());
    localStorage.setItem(crudList, JSON.stringify(list.getValue()));
  }

  update(update: MaintenanceRecord | DashboardCard, crudList: string) {
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

  delete(item: MaintenanceRecord | DashboardCard, crudList: string) {
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
        this.get<DashboardCard[]>(`${environment.dataURL}/app/${crudList}.json`).subscribe(res => this._crud[crudList].next(res));
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

  // Start Socket class overrides

  emit(event: string, ...args: any[]): void {
    this.emits[event] ? this.emits[event](args) : null;

  }

  fromOneTimeEvent<T>(event: string): Promise<T> {
    return this.oneTimeEvents[event];
  }

  fromEvent<T>(event: string): Observable<T> {
    return this.fromEvents[event];
  }

  on(event: string, cb: Function): void { }

}
