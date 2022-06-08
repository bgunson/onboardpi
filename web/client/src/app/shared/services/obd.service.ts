import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { share, takeWhile, timeout } from 'rxjs/operators';
import { OBDSocket } from 'src/app/app.module';
import { SettingsService } from 'src/app/settings/settings.service';
import { OBDCommand, OBDResponse, Protocol, ResponseSet } from '../models/obd.model';


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

  private _status$: BehaviorSubject<string> = new BehaviorSubject<string>("Not Connected");
  private _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  connectingNow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);    // TODO: maybe make this server side from appSocket event so other clients know if connecting

  constructor(
    private socket: OBDSocket, 
    private snackBar: MatSnackBar,
    private settingsService: SettingsService
  ) { 
    socket.on('unwatch', () => this.watch([...this._watchList]));

    socket.fromEvent<string>('status').subscribe(v => this._status$.next(v));
    socket.fromEvent<boolean>('is_connected').subscribe(v => this._isConnected$.next(v));

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
      this._status$.next("Not Connected");
    });

    socket.on('connect', () => {
      this.getStatus();
      this.isConnected();
    });
  }

  getConnection(): void {
    this.isConnected();
    this.getStatus();
    if (!this.connectingNow.getValue()) {
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
            this.snackBar.open("Unable to connect to the vehicle", "Dismiss", { verticalPosition: 'top', duration: 4000 })
          },
          () => this.connectingNow.next(false)
        );
    }
  }

  connect(): void {
    this.socket.emit('connect_obd');
  }

  disconnect(): void {
    this.socket.emit('close');
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

  supports(cmd: OBDCommand): Promise<boolean> {
    this.socket.emit('supports', cmd.name);
    return this.socket.fromOneTimeEvent<boolean>('supports');
  }

  getSupported(): Promise<OBDCommand[]> {
    this.socket.emit('supported_commands');
    return this.socket.fromOneTimeEvent<any>('supported_commands');
  }

  allDTCs(): Promise<{[key: string]: string}> {
    this.socket.emit('all_dtcs');
    return this.socket.fromOneTimeEvent<{[key: string]: string}>('all_dtcs');
  }

  allProtocols(): Promise<Protocol[]> {
    this.socket.emit('all_protocols');
    return this.socket.fromOneTimeEvent<Protocol[]>('all_protocols');
  }

  allCommands(): Promise<OBDCommand[][]> {
    this.socket.emit('all_commands');
    return this.socket.fromOneTimeEvent<any>('all_commands');
  }

  /** 
   * Check if user has 'Supported only' setting chosen under OBD Connection settings
   * 
   * TODO: this should be implemented server side (OBDServer)
   * 
   * @returns All OBD commands or only those supported if the seeting is true
   */
  async usersCommands(): Promise<OBDCommand[][]> {
    let cmds = this.allCommands();    
    
    const settings = await this.settingsService.getSettings();
    if (settings.connection.supported_only) {
      const supported = await this.getSupported().then(cmds => cmds.map(c => c.name));
      cmds = cmds.then(modes => modes.map(cmds => cmds.filter(c => c ? supported.includes(c.name) : false)));
    }
    return cmds;
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
