import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { Observable, of } from "rxjs";
import { DashboardCard } from "src/app/features/dashboard/models/dashboard.model";
import { MaintenanceRecord } from "src/app/features/maintenance/models/maintenance.model";
import { environment } from "src/environments/environment";
import { Settings } from "../../features/settings/models/settings.model";

const injector = Injector.create({
  providers: [
      { provide: HttpClient, deps: [HttpHandler] },
      { provide: HttpHandler, useValue: new HttpXhrBackend({ build: () => new XMLHttpRequest }) },
  ]
});

export class DemoAppSocket {

  private _http: HttpClient = injector.get(HttpClient);

  oneTimeEvents: { [event: string]: Promise<any> } = {
    'settings:response': this._http.get<Settings>(environment.dataURL + '/app/settings.json').toPromise()
  }

  fromEvents: { [event: string]: Observable<any> } = {
    'dashboard_cards:response': this._http.get<DashboardCard[]>(environment.dataURL + '/app/dashboard_cards.json'),
    'maintenance:response': this._http.get<MaintenanceRecord[]>(environment.dataURL + '/app/maintenance.json')
  } 
  
  constructor(args: any) { }

  emit(event: string, ...args: any[]): void {
      console.log("APP EMIT", event);
  }

  fromOneTimeEvent<T>(event: string): Promise<T> {
      console.log("APP FROM ONE TIEM EVENT", event)
      return this.oneTimeEvents[event];
  }

  fromEvent<T>(event: string): Observable<T> {
      console.log("APP FROM EVENT", event);
      return this.fromEvents[event];
  }

  on(event: string, cb: Function): void { }
}
