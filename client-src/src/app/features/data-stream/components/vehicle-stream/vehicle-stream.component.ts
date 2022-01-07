import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { OBDCommand, ResponseSet } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'data-stream-vehicle',
  templateUrl: './vehicle-stream.component.html',
  styleUrls: ['./vehicle-stream.component.scss']
})
export class VehicleStreamComponent implements OnInit, OnDestroy {

  /** Mode 1 commands only */
  commands$: Promise<OBDCommand[]>; 
  filteredCommands$: Promise<OBDCommand[]>; 

  watchList: string[];

  unwatchSub: Subscription = new Subscription();

  carConnected$: Observable<boolean>;

  watch$: Observable<ResponseSet>;

  supportedCmds$: Promise<any[]>;
  protocolName$: Promise<string>;
  portName$: Promise<string>;

  constructor(private obd: OBDService, public display: DisplayService) { }

  isNumber(value: any): boolean {
    return !isNaN(value);
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredCommands$ = this.commands$
      .then(commands => {
        return commands.filter(cmd => cmd.name.toLowerCase().includes(filterValue) || cmd.desc.toLowerCase().includes(filterValue));
      })
  }

  ngOnInit(): void {
    this.carConnected$ = this.obd.isConnected();
    this.watch$ = this.obd.getWatching().pipe(throttleTime(1000));

    this.commands$ = this.obd.allCommands().then(all => {
      let modeOne: OBDCommand[] = all[1];
      this.watchList = modeOne.map(cmd => cmd.name);
      this.obd.watch(this.watchList);
      this.unwatchSub = this.obd.unwatched.subscribe(() => this.obd.watch(this.watchList));
      return modeOne;
    });
    this.filteredCommands$ = this.commands$;

    // OBD Connection section variables
    this.supportedCmds$ = this.obd.getSupported();
    this.protocolName$ = this.obd.getProtocolName();
    this.portName$ = this.obd.getPortName();
  }

  ngOnDestroy(): void {
    this.obd.unwatch(this.watchList);
    this.unwatchSub.unsubscribe();
  }

}
