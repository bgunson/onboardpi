import { Observable, of } from "rxjs";

export class DemoSocket {
    constructor(args: any) {

    }

    emit(name: string, ...args: any[]): void {

    }

    fromOneTimeEvent<T>(event: string): Promise<T> {
        return new Promise<T>(() => {});
    }

    fromEvent<T>(event: string): Observable<T> {
        return of<T>();
    }

    on(event: string, cb: Function): void {

    }
}
