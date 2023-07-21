import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { BehaviorSubject, from, interval, Observable, of } from "rxjs";
import { delay, map, shareReplay, switchMap, take } from "rxjs/operators";
import { OBDCommand, Protocol, ResponseSet } from "src/app/shared/models/obd.model";
import { DemoSocket } from "./demo-socket";

export class DemoOBDSocket extends DemoSocket {

  private _watchList: Set<string> = new Set<string>();

  // is the car connected? default true for demo/testing
  private _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _status$: BehaviorSubject<string> = new BehaviorSubject<string>('Car Connected');

  private _watch$: Observable<ResponseSet> = interval(500).pipe(
    switchMap(() => this.getCache<ResponseSet>('obd/snapshot')),
    map((snapshot) => {
      var response: ResponseSet = {};
      [...this._watchList].forEach((cmd: string) => {
        if (snapshot[cmd]) {
          response[cmd] = {
            value: !cmd.startsWith('DTC') ? this.generateValue(snapshot[cmd].value) : snapshot[cmd].value,
            time: Date.now(),
            command: snapshot[cmd].command,
            unit: snapshot[cmd].unit
          }
        }
      });
      return response;
    })
  );

  fromEvents: { [event: string]: Observable<any> } = {
    'is_connected': this._isConnected$.asObservable(),
    'status': this._status$.asObservable(),
    'watching': this._watch$
  }

  emits: { [event: string]: Function } = {
    'watch': (cmds: string[]) => cmds.forEach((cmd: string) => this._watchList.add(cmd)),
    'unwatch': (cmds: string[]) => cmds.forEach((cmd: string) => this._watchList.delete(cmd)),
    'connect_obd': (resolve: Function) => {
      this._isConnected$.next(true);
      this._status$.next('Car Connected');
      resolve(true);
    },
    'close': () => {
      this._isConnected$.next(false);
      this._status$.next('Not Connected');
    },
    'port_name': (resolve: Function) => resolve('/dev/demo/port'),
    'protocol_name': (resolve: Function) => resolve('DEMO'),
    'all_commands': (resolve: Function) => this.getCache<OBDCommand[]>('obd/all_commands').subscribe(all => resolve(all)),
    'all_protocols': (resolve: Function) => this.getCache<OBDCommand[]>('obd/all_protocols').subscribe(all => resolve(all)),
    'supported_commands': (resolve: Function) => this.getCache<OBDCommand[]>('obd/supported_commands').subscribe(all => resolve(all)),
    'injector_state': (resolve: Function) => resolve({}),
    'available_ports': (resolve: Function) => resolve([]),
  }

  constructor(args: any) {
    super();
    console.log("Demo OBD socket created")
  }

}
