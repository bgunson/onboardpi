import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConnectionParameters, Settings } from '../../settings.model';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'obd-connection-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss', '../../settings.component.scss']
})
export class CommandsComponent implements OnInit, OnDestroy {

  settings$: Promise<Settings>;
  connection$: Promise<ConnectionParameters>

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => s.connection);
  }

  ngOnDestroy(): void {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}
