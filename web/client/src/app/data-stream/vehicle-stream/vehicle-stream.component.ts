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

  watchList: string[] = ['ELM_VERSION', 'ELM_VOLTAGE'];

  unwatchSub: Subscription = new Subscription();

  carConnected$: Observable<boolean>;

  watch$: Observable<ResponseSet>;

  protocolName$: Promise<string>;
  portName$: Promise<string>;

  constructor(private obd: OBDService, public display: DisplayService) { }

  applyFilter(value: string) {
    const filterValue = value.toLowerCase().trim();
    this.filteredCommands$ = this.commands$
      .then(commands => {
        return commands.filter(cmd => cmd.name.toLowerCase().includes(filterValue) || cmd.desc.toLowerCase().includes(filterValue));
      });
  }

  ngOnInit(): void {
    this.carConnected$ = this.obd.isConnected();
    this.watch$ = this.obd.getWatching().pipe(throttleTime(500));

    // Watch mode 1 commands
    this.commands$ = this.obd.usersCommands().then(all => {
      let modeOne: OBDCommand[] = all[1];
      this.watchList = this.watchList.concat(modeOne.map(cmd => cmd.name));
      this.obd.watch(this.watchList);
      return modeOne;
    });
    this.filteredCommands$ = this.commands$;

    // OBD Connection section variables
    this.protocolName$ = this.obd.getProtocolName();
    this.portName$ = this.obd.getPortName();
  }

  ngOnDestroy(): void {
    this.obd.unwatch(this.watchList);
    this.unwatchSub.unsubscribe();
  }

}
