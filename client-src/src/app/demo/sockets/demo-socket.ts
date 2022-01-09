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

    /**
     * If value is a number, +- a random amount within 10% of the original.
     * @param value 
     * @returns 
     */
     generateValue(value: any) {
        if (typeof value === 'number') {
            let max = value * 0.2;
            let min = -max;
            return value + Math.random() * (max - min) + min;
        } else {
            return value;
        }
    }

    get<T>(url: string): Observable<T> {
        return this._http.get<T>(url);
    }

}
