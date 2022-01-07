import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { share, takeWhile, timeout } from 'rxjs/operators';
import { OBDSocket } from 'src/app/app.module';
import { OBDCommand, OBDResponse, ResponseSet } from '../../shared/models/obd.model';


/**
 * This service handles communication with the OBD websocket server to control the connection with the vehicle through the python-OBD API.
 * See https://github.com/bgunson/obd-socketio
 */
@Injectable({
  providedIn: 'root'
})
export class OBDService {

  unwatched: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
 
  private _watching$: Observable<any>;

  private _status$: BehaviorSubject<string> = new BehaviorSubject<string>("Not Connected");
  private _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  connectingNow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);    // TODO: maybe make this server side from appSocket event so other clients know if connecting

  constructor(private socket: OBDSocket) { 
    socket.on('unwatch', (unwatched: string[]) => this.unwatched.next(unwatched));

    socket.fromEvent<string>('status').subscribe(v => this._status$.next(v));
    socket.fromEvent<boolean>('is_connected').subscribe(v => this._isConnected$.next(v));

    socket.on('disconnect', () => {
      this._isConnected$.next(false);
      this._status$.next("Not Connected");
    });

    socket.on('connect', () => {
      this.unwatched.next([]);  // this will make modules re-watch when connection is disrupted
      this.getStatus();
      this.isConnected();
    });
  }

  getConnection(): void {
    this.connectingNow.next(true);
    this.getStatus();
    this.isConnected()
      .pipe(
        takeWhile(v => v === false),
        timeout(10000)
      ).subscribe(
        () => {},
        () => {
          this.connectingNow.next(false);
          alert("Unable to connect to the vehicle. Please check your connection your OBD adapter and connection parameters in settings.")
        },
        () => this.connectingNow.next(false)
      );
  }

  getStatus(): BehaviorSubject<string> {
    this.socket.emit('status');
    return this._status$;
  }

  isConnected(): BehaviorSubject<boolean> {
    this.socket.emit('is_connected');
    return this._isConnected$;
  }

  watch(cmds: string[]): void {
    this.socket.emit('join_watch');
    this.socket.emit('watch', cmds);
  }

  unwatch(cmds: string[]): void {
    this.socket.emit('leave_watch');
    this.socket.emit('unwatch', cmds);
  }

  query(cmd: string): Promise<OBDResponse> {
    this.socket.emit('query', cmd);
    return this.socket.fromOneTimeEvent<any>('query');
  }
  
  getWatching(): Observable<ResponseSet> {
    if (!this._watching$) {
      this._watching$ = this.socket.fromEvent<any>('watching').pipe(share());
    }
    return this._watching$;
  }

  getCommand(cmd: string): Promise<OBDCommand> {
    this.socket.emit('get_command', cmd);
    return this.socket.fromOneTimeEvent<OBDCommand>('get_command');
  }

  getSupported(): Promise<OBDCommand[]> {
    this.socket.emit('supported_commands');
    return this.socket.fromOneTimeEvent<any>('supported_commands');
  }

  allCommands(): Promise<OBDCommand[][]> {
    this.socket.emit('all_commands');
    return this.socket.fromOneTimeEvent<any>('all_commands');
  }

  getProtocolName(): Promise<string> {
    this.socket.emit('protocol_name');
    return this.socket.fromOneTimeEvent<string>('protocol_name');
  }

  getPortName(): Promise<string> {
    this.socket.emit('port_name');
    return this.socket.fromOneTimeEvent<string>('port_name');
  }

}
