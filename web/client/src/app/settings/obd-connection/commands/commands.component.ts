import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OBDCommand } from 'src/app/shared/models/obd.model';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Connection, Settings } from '../../settings.model';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'obd-connection-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss', '../../settings.component.scss']
})
export class CommandsComponent implements OnInit, OnDestroy {

  settings$: Promise<Settings>;
  connection$: Promise<Connection>;
  modeIndex: number;

  commands$: Observable<OBDCommand[][]>;
  filteredCommands$: Observable<OBDCommand[][]>;
  supportedCommands$: Promise<string[]>;

  constructor(
    private settingsService: SettingsService,
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
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => s.connection);

    
    this.commands$ = from(this.obd.allCommands());
    this.filteredCommands$ = this.commands$;

    this.supportedCommands$ = this.obd.getSupported().then(cmds => cmds.map(c => c.name));
  }

  ngOnDestroy(): void {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}


