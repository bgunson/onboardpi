import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { shareReplay, takeWhile, timeout } from 'rxjs/operators';
import { OBDSocket } from 'src/app/app.module';
import { SettingsService } from 'src/app/settings/settings.service';
import { DTCSet, OBDCommand, OBDResponse, Protocol, ResponseSet } from '../models/obd.model';


/**
 * This service handles communication with the OBD websocket server to control the connection with the vehicle through the python-OBD API.
 * See https://github.com/bgunson/obd-socketio
 */
@Injectable({
  providedIn: 'root'
})
export class OBDService {
 
  private _watching$: Observable<any>;

  /** Active set of watched commands by name */
  private _watchList: Set<string> = new Set<string>();

  private _status$: Subject<string>;
  private _isConnected$: Subject<boolean>;
  // connectingNow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);    // TODO: maybe make this server side from appSocket event so other clients know if connecting

  constructor(
    private socket: OBDSocket,
    private settingsService: SettingsService
  ) { 

    socket.on('unwatch', () => this.watch([...this._watchList]));

    this._isConnected$ = socket.fromEvent<boolean>('is_connected') as Subject<boolean>;
    this._status$ = socket.fromEvent<string>('status') as Subject<string>;  

    socket.on('obd_closed', () => {
      this.isConnected();
      this.getStatus();
    });

    socket.on('obd_connecting', () => {
      this.getStatus();
      this.isConnected();
    });

    socket.on('disconnect', () => {
      this._isConnected$.next(false);
      this._status$.next('Not Connected');
    });

    socket.on('connect', () => {
      this.getStatus();
      this.isConnected();
    });
  }

  async waitForConnection(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const connected: boolean = await this.isConnected().pipe(takeWhile(v => v === false), timeout(5000)).toPromise();
      } catch(err) {
        const connectObd: boolean = confirm(`Looks like the vehicle is not connected. Would you like to try to connect now?\n${err}`);
        if (connectObd) {
          return this.connect().then((connected) => resolve(connected));
        } else {
          reject(false);
        }
      }
    });
  }

  connect(): Promise<boolean> {
    return new Promise<boolean>((resolve) => this.socket.emit('connect_obd', resolve));
  }

  disconnect(): void {
    this.socket.emit('close');
  }

  getStatus(): Observable<string> {
    this.socket.emit('status');
    return this._status$;
  }

  isConnected(): Observable<boolean> {
    this.socket.emit('is_connected');
    return this._isConnected$;
  }

  watch(cmds: string[]): void {
    cmds.forEach(c => this._watchList.add(c));
    this.socket.emit('join_watch');
    this.socket.emit('watch', cmds);
  }

  unwatch(cmds: string[]): void {
    cmds.forEach(c => this._watchList.delete(c));
    this.socket.emit('leave_watch');
    this.socket.emit('unwatch', cmds);
  }

  query(cmd: string): Promise<OBDResponse> {
    return new Promise<OBDResponse>(resolve => this.socket.emit('query', cmd, resolve));
  }
  
  getWatching(): Observable<ResponseSet> {
    if (!this._watching$) {
      this._watching$ = this.socket.fromEvent<ResponseSet>('watching');
    }
    return this._watching$;
  }

  getCommand(cmd: string): Promise<OBDCommand> {
    return new Promise<OBDCommand>(resolve => this.socket.emit('get_command', cmd, resolve));
  }

  supports(cmd: OBDCommand): Promise<boolean> {
    return new Promise<boolean>(resolve => this.socket.emit('supports', cmd.name, resolve));
  }

  getSupported(): Promise<OBDCommand[]> {
    return new Promise<OBDCommand[]>(resolve => this.socket.emit('supported_commands', resolve));
  }

  allDTCs(): Promise<DTCSet> {
    return new Promise<DTCSet>(resolve => this.socket.emit('all_dtcs', resolve));
  }

  allProtocols(): Promise<Protocol[]> {
    return new Promise<Protocol[]>(resolve => this.socket.emit('all_protocols', resolve));
  }

  allCommands(): Promise<OBDCommand[][]> {
    return new Promise<OBDCommand[][]>(resolve => this.socket.emit('all_commands', resolve));
  }

  /** 
   * Check if user has 'Supported only' setting chosen locally
   *  
   * @returns All OBD commands or only those supported if the seeting is true
   */
  async usersCommands(): Promise<OBDCommand[][]> {
    let cmds = this.allCommands();        
    if (this.settingsService.getUserSetting('supportedOnly') === "true") {
      const supported = await this.getSupported().then(cmds => cmds.map(c => c.name));
      cmds = cmds.then(modes => modes.map(cmds => cmds.filter(c => c ? supported.includes(c.name) : false)));
    }
    return cmds;
  }

  getProtocolName(): Promise<string> {
    return new Promise<string>(resolve => this.socket.emit('protocol_name', resolve));
  }

  getPortName(): Promise<string> {
    return new Promise<string>(resolve => this.socket.emit('port_name', resolve));
  }

  getAvailablePorts(): Promise<string[]> {
    return new Promise<string[]>(resolve => this.socket.emit('available_ports', resolve));
  }

  getInjectorState(injectorType: string): Promise<any> {
    return new Promise(resolve => this.socket.emit('injector_state', injectorType, resolve));
  }

  setLoggerLevel(loggerName: string, level: string) {
    this.socket.emit('set_logger_level', loggerName, level);
  }

  enableInjector(injectorType: string) {
    this.socket.emit('enable_injector', injectorType);
  }

  disableInjector(injectorType: string) {
    this.socket.emit('disable_injector', injectorType);
  }

}
