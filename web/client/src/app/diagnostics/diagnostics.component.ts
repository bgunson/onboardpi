import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OBDCommand } from 'src/app/shared/models/obd.model';
import { ActionService } from 'src/app/shared/services/action.service';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';


@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit, OnDestroy {

  diagnosticCmds = [
    'FUEL_STATUS',
    'STATUS',
    'FREEZE_DTC',
    'GET_DTC',
    'GET_CURRENT_DTC'
  ]

  commands$: OBDCommand[];

  dtcLookup$: Promise<any>;
  dtcs$: Observable<any>;
  carConnected$: Observable<boolean>;

  constructor(
    private obd: OBDService, 
    public display: DisplayService
  ) { }


  ngOnInit(): void {
    // this.action.setActionBtn('delete_sweep'); // Clear code button on toolbar maybe?
    this.carConnected$ = this.obd.isConnected();
    this.obd.watch(this.diagnosticCmds);
    // this.dtcLookup$ = this.obd.allDTCs();
    this.dtcs$ = this.obd.getWatching();
  }

  ngOnDestroy() {
    this.obd.unwatch(this.diagnosticCmds);
  }

}
