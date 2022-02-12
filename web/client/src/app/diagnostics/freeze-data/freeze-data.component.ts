import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDCommand, OBDResponse, ResponseSet } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'app-freeze-data',
  templateUrl: './freeze-data.component.html',
  styleUrls: ['./freeze-data.component.scss', '../diagnostics.component.scss']
})
export class FreezeDataComponent implements OnInit, OnDestroy {

  /**
   * Mode 2 commands
   */
  commands$: Promise<OBDCommand[]>;
  filteredCommands$: Promise<OBDCommand[]>;

  live$: Observable<ResponseSet>;

  constructor(private obd: OBDService, public display: DisplayService) { }

  applyFilter(value: string) {
    const filterValue = value.toLocaleLowerCase().trim();
    this.filteredCommands$ = this.commands$
      .then(commands => {
        return commands.filter(cmd => cmd.name.toLowerCase().includes(filterValue) || cmd.desc.toLowerCase().includes(filterValue));
      })
  }


  ngOnInit(): void {
    this.commands$ = this.obd.allCommands().then(all => {
      let modeTwo = all[2];
      this.obd.watch(modeTwo.map(cmd => cmd.name));
      return modeTwo;
    });
    this.filteredCommands$ = this.commands$;
    this.live$ = this.obd.getWatching();
  }

  ngOnDestroy(): void {
      this.commands$.then(cmds => this.obd.unwatch(cmds.map(cmd => cmd.name)));
  }

}
