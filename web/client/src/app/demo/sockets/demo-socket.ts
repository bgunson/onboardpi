import { HttpClient, HttpHandler, HttpXhrBackend } from "@angular/common/http";
import { Injector } from "@angular/core";
import { Observable } from "rxjs";

const injector = Injector.create({
    providers: [
        { provide: HttpClient, deps: [HttpHandler] },
        { provide: HttpHandler, useValue: new HttpXhrBackend({ build: () => new XMLHttpRequest }) },
    ]
});

export class DemoSocket {

    private _http: HttpClient = injector.get(HttpClient);

    emits: { [event: string]: Function };
    oneTimeEvents: { [event: string]: Promise<any> };
    fromEvents: { [event: string]: Observable<any> };

    /**
     * If value is a number, +- a random amount within 50% of the original.
     * @param value 
     * @returns 
     */
    generateValue(value: any) {
        if (typeof value === 'number') {
            let max = value * 0.5;
            let min = -max;
            return value + Math.random() * (max - min) + min;
        } else {
            return value;
        }
    }

    get<T>(url: string): Observable<T> {
        return this._http.get<T>(url);
    }

    emit(event: string, ...args: any): void {
        if (event in this.emits) {
            this.emits[event](args);
        }
        // not having an emit event defined is OK for demo purpoese for now, if we wish to get better coverage
        // then throw this error and run `npm test` to see holes.
        // else {
        //     throw new Error(`${this.constructor.name}.emit#${event} is not implemented.`);
        // }
    }

    fromOneTimeEvent<T>(event: string): Promise<T> {
        if (event in this.oneTimeEvents) {
            return this.oneTimeEvents[event];
        } else {
            throw new Error(`${this.constructor.name}.fromOneTimeEvent#${event} is not implemented.`);
        }
    }

    fromEvent<T>(event: string): Observable<T> {
        if (event in this.fromEvents) {
            return this.fromEvents[event];
        } else {
            throw new Error(`${this.constructor.name}.fromEvent#${event} is not implemented.`);
        }
    }

    on(event: string, cb: Function): void { }

}
