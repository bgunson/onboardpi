import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OBDCommand } from 'src/app/shared/models/obd.model';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Connection, Settings } from '../../settings.model';

@Component({
  selector: 'app-command-lookup',
  templateUrl: './command-lookup.component.html',
  styleUrls: ['./command-lookup.component.scss']
})
export class CommandLookupComponent implements OnInit {

  connection$: Promise<Connection>;
  modeIndex: number;

  commands$: Observable<OBDCommand[][]>;
  filteredCommands$: Observable<OBDCommand[][]>;
  supportedCommands$: Promise<string[]>;

  constructor(
    private obd: OBDService
  ) { }

  applyFilter(value: string) {
    const filterValue = value.toLowerCase().trim();
    this.filteredCommands$ = this.commands$.pipe(
      map(modes => modes.map(mode => mode.filter(cmd => cmd ? cmd.name.toLowerCase().includes(filterValue) || cmd.desc.toLowerCase().includes(filterValue) : false)))
    );
  }

  ngOnInit(): void {
    this.modeIndex = 1;
    
    this.commands$ = from(this.obd.allCommands());
    this.filteredCommands$ = this.commands$;

    this.supportedCommands$ = this.obd.getSupported().then(cmds => cmds.map(c => c.name));
  }

}
