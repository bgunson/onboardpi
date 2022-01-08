import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { interval, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { OBDCommand, ResponseSet } from "../shared/models/obd.model";

const injector = Injector.create({
    providers: [
        { provide: HttpClient, deps: [HttpHandler] },
        { provide: HttpHandler, useValue: new HttpXhrBackend({ build: () => new XMLHttpRequest }) },
    ]
})

export class DemoOBDSocket {

    private _http: HttpClient = injector.get(HttpClient);

    private _allCommands$: Observable<OBDCommand[]>;

    private _watchList: Set<string> = new Set<string>();
    watch$: Observable<ResponseSet> = interval(500).pipe(
        map(() => {
            var response: ResponseSet = {};
            [...this._watchList].forEach((cmd: string) => {
                response[cmd] = {
                    value: Math.random() * 8000,
                    time: Date.now(),
                    command: {
                        name: 'RPM',
                        desc: 'ENGINE RPM'
                    },
                    unit: 'revolutions_per_minute'
                }
            });
            return response;
        })
    );

    oneTimeEvents: { [event: string]: Promise<any> } = {
        'port_name': new Promise<string>(resolve => resolve('/dev/demo/port')),
        'protocol_name': new Promise<string>(resolve => resolve('DEMO')),
        'all_commands': this._http.get<OBDCommand[]>(environment.dataURL + '/obd/all_commands.json').toPromise(),
        'supported_commands': this._http.get(environment.dataURL + '/obd/supported_commands.json').toPromise()
    }

    fromEvents: { [event: string]: Observable<any> } = {
        'is_connected': of(true),
        'status': of('Car Connected'),
        'watching': this.watch$
    }

    emits: { [event: string]: Function } = {
        'watch': (args: any[]) => args[0] && args[0].length ? args[0].forEach((cmd: string) => this._watchList.add(cmd)): null,
        'unwatch': (args: any[]) => args[0] && args[0].length ? args[0].forEach((cmd: string) => this._watchList.delete(cmd)): null
    }

    constructor(args: any) { }

    //////////////////////////////////////////

    emit(event: string, ...args: any): void {
        console.log("OBD EMIT", event, args)
        this.emits[event] ? this.emits[event](args) : null;
    }

    fromOneTimeEvent<T>(event: string): Promise<T> {
        console.log('OBD ONE TIME EVENT', event);
        return this.oneTimeEvents[event];
    }

    fromEvent<T>(event: string): Observable<T> {
        console.log("OBD FROM EVENT", event);
        return this.fromEvents[event];
    }

    on(event: string, cb: Function): void {

    }
}
