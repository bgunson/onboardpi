import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { interval, Observable, of } from "rxjs";
import { map, share, shareReplay, switchMap, take } from "rxjs/operators";
import { OBDCommand, ResponseSet } from "src/app/shared/models/obd.model";
import { environment } from "src/environments/environment";
import { DemoSocket } from "./demo-socket";


export class DemoOBDSocket extends DemoSocket {

    private _allCommands$: Observable<OBDCommand[]>;

    private _snapshot$: Observable<ResponseSet>;

    private _watchList: Set<string> = new Set<string>();

    private _watch$: Observable<ResponseSet> = interval(500).pipe(
        switchMap(() => this.getSnapshot()), 
        map((snapshot) => {
            var response: ResponseSet = {};
            [...this._watchList].forEach((cmd: string) => {
                if (snapshot[cmd]) {
                    response[cmd] = {
                        value: this.generateValue(snapshot[cmd].value),
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
        'port_name': new Promise<string>(resolve => resolve('/dev/demo/port')),
        'protocol_name': new Promise<string>(resolve => resolve('DEMO')),
        'all_commands': this.get<OBDCommand[]>(environment.dataURL + '/obd/all_commands.json').toPromise(),
        'supported_commands': this.get(environment.dataURL + '/obd/supported_commands.json').toPromise()
    }

    fromEvents: { [event: string]: Observable<any> } = {
        'is_connected': of(true),
        'status': of('Car Connected'),
        'watching': this._watch$
    }

    emits: { [event: string]: Function } = {
        'watch': (args: any[]) => (args[0] && args[0].length) ? args[0].forEach((cmd: string) => this._watchList.add(cmd)) : null,
        'unwatch': (args: any[]) => (args[0] && args[0].length) ? args[0].forEach((cmd: string) => this._watchList.delete(cmd)) : null
    }

    constructor(args: any) {
        super();
    }

    getSnapshot(): Observable<ResponseSet> {
        if (!this._snapshot$) {
            this._snapshot$ = this.get<ResponseSet>(environment.dataURL + '/obd/snapshot.json').pipe(shareReplay());
        }
        return this._snapshot$;
    }

    // Start Socket class overrides

    emit(event: string, ...args: any): void {
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
