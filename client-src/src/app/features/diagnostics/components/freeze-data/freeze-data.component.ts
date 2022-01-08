import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDCommand, OBDResponse, ResponseSet } from 'src/app/shared/models/obd.model';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'app-freeze-data',
  templateUrl: './freeze-data.component.html',
  styleUrls: ['./freeze-data.component.scss', '../../diagnostics.component.scss']
})
export class FreezeDataComponent implements OnInit, OnDestroy {

  /**
   * Mode 2 commands
   */
  commands$: Promise<OBDCommand[]>;
  live$: Observable<ResponseSet>;

  constructor(private obd: OBDService) { }

  pluck(cmd: string): Observable<OBDResponse> {
    return this.live$.pipe(pluck(cmd));
  }

  ngOnInit(): void {
    this.commands$ = this.obd.allCommands().then(all => {
      let modeTwo = all[2];
      this.obd.watch(modeTwo.map(cmd => cmd.name));
      return modeTwo;
    });
    this.live$ = this.obd.getWatching();
  }

  ngOnDestroy(): void {
      this.commands$.then(cmds => this.obd.unwatch(cmds.map(cmd => cmd.name)));
  }

}
