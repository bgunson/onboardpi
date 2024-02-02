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

  subscriptions: Subscription = new Subscription();

  constructor(
    private obd: OBDService,
    public display: DisplayService,
    private action: ActionService
  ) { }


  ngOnInit(): void {
    this.action.setAction('delete_sweep'); // Clear code button on toolbar maybe?
    this.carConnected$ = this.obd.isConnected();
    this.obd.watch(this.diagnosticCmds);
    // this.dtcLookup$ = this.obd.allDTCs();
    this.dtcs$ = this.obd.getWatching();

    const actionSubscription = this.action.actionClick.subscribe(() => {
      const clear = window.confirm(`Are you sure you want to clear your engine fault codes ?
      
DISCLAIMER
      
This feature is intended to reset diagnostic trouble codes(DTCs) in your car's onboard diagnostics (OBD) system. It does not fix any underlying issues or ensure vehicle repair. Consult a qualified automotive professional before clearing codes.Clearing codes without addressing root causes may cause damage or compromise safety. You are solely liable for any actions taken using this feature.We are not responsible for any negative consequences or damages. Clearing codes may be temporary.Codes may reappear if underlying issues are not addressed adequately.`);

      if (clear) {
        this.obd.query('CLEAR_DTC');
      }

    });

    this.subscriptions.add(actionSubscription);
  }

  ngOnDestroy() {
    this.obd.unwatch(this.diagnosticCmds);
    this.subscriptions.unsubscribe();
  }

}
