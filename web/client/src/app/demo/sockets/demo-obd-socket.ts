import { BehaviorSubject, interval, Observable } from "rxjs";
import { concatMap, filter, flatMap, map, mergeMap, shareReplay, switchMap } from "rxjs/operators";
import { OBDCommand, OBDResponse, ResponseSet } from "src/app/shared/models/obd.model";
import { environment } from "src/environments/environment";
import { DemoSocket } from "./demo-socket";
import { Settings } from "src/app/settings/settings.model";

export class DemoOBDSocket extends DemoSocket {

    private _allCommands$: Observable<OBDCommand[]>;

    private _snapshot$: Observable<ResponseSet>;

    private _watchList: Set<string> = new Set<string>();

    // is the car connected? default true for demo/testing
    private _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private _status$: BehaviorSubject<string> = new BehaviorSubject<string>('Car Connected');

    private _watch$: Observable<OBDResponse> = interval(500).pipe(
        switchMap(() => this.getSnapshot().pipe(
            mergeMap(snapshot => {
                const settings = this.getSettings();
                const watchedKeys = Object.keys(snapshot).filter(cmd => this._watchList.has(cmd));

                return watchedKeys
                    .map(cmd => snapshot[cmd])
                    .filter(response => response?.command?.name != null)
                    .map(response => {
                        return {
                            ...response,
                            value: !response.command.name.startsWith('DTC') ? this.generateValue(response?.value) : response?.value,
                            time: Date.now(),
                            unit: settings?.imperial_units === true ? this.imperialUnit(response?.unit) : response?.unit
                        };
                    });
            })
        ))
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
        'close': () => {
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

    private getSettings(): Settings | null {
        const localSettings = sessionStorage.getItem("settings");
        return localSettings ? JSON.parse(localSettings) : null;
    }

    private imperialUnit = (metricUnit: string): string => {
        switch (metricUnit) {
            case "degree_Fahrenheit":
            case "degC":
                return "°F"

            case "gps":
                return "lb/min";

            case "kilopascal":
                return "psi";

            case "kilometers":
            case "kilometer":
                return "miles";

            case "kilometer_per_hour":
            case "kph":
                return "mph";

            default:
                return metricUnit;
        }
    }

}
