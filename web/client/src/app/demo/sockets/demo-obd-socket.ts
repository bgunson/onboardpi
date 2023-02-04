import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { BehaviorSubject, from, interval, Observable, of } from "rxjs";
import { delay, map, shareReplay, switchMap, take } from "rxjs/operators";
import { OBDCommand, ResponseSet } from "src/app/shared/models/obd.model";
import { environment } from "src/environments/environment";
import { DemoSocket } from "./demo-socket";

export class DemoOBDSocket extends DemoSocket {

    private _allCommands$: Observable<OBDCommand[]>;

    private _snapshot$: Observable<ResponseSet>;

    private _watchList: Set<string> = new Set<string>();

    // is the car connected? default true for demo/testing
    private _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private _status$: BehaviorSubject<string> = new BehaviorSubject<string>('Car Connected');

    private _watch$: Observable<ResponseSet> = interval(500).pipe(
        switchMap(() => this.getSnapshot()), 
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

    oneTimeEvents: { [event: string]: Promise<any> } = {
        'port_name': Promise.resolve('/dev/demo/port'),
        'protocol_name': Promise.resolve('DEMO'),
        'all_commands': this.get<OBDCommand[]>(environment.dataURL + '/obd/all_commands.json').toPromise(),
        'all_protocols': this.get<OBDCommand[]>(environment.dataURL + '/obd/all_protocols.json').toPromise(),
        'supported_commands': this.get(environment.dataURL + '/obd/supported_commands.json').toPromise(),
        'connect_obd': Promise.resolve(true),
        'available_ports': Promise.resolve([]),
        'injector_state': Promise.resolve({})
    }

    fromEvents: { [event: string]: Observable<any> } = {
        'is_connected': this._isConnected$.asObservable(),
        'status': this._status$.asObservable(),
        'watching': this._watch$
    }

    emits: { [event: string]: Function } = {
        'watch': (args: any[]) => (args[0] && args[0].length) ? args[0].forEach((cmd: string) => this._watchList.add(cmd)) : null,
        'unwatch': (args: any[]) => (args[0] && args[0].length) ? args[0].forEach((cmd: string) => this._watchList.delete(cmd)) : null,
        'connect_obd': () => {
            this._isConnected$.next(true);
            this._status$.next('Car Connected');
        }, 
        'close': () =>  {
            this._isConnected$.next(false);
            this._status$.next('Not Connected');
        }
    }

    constructor(args: any) {
        super();
        console.log("Demo OBD socket created")
    }

    getSnapshot(): Observable<ResponseSet> {
        if (!this._snapshot$) {
            this._snapshot$ = this.get<ResponseSet>(environment.dataURL + '/obd/snapshot.json').pipe(shareReplay());
        }
        return this._snapshot$;
    }

}
