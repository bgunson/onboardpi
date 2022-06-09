import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { DisplayService } from 'src/app/shared/services/display.service';
import { ConnectionParameters, Settings } from '../../settings.model';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'obd-connection-log-level',
  templateUrl: './log-level.component.html',
  styleUrls: ['./log-level.component.scss', '../../settings.component.scss']
})
export class LogLevelComponent implements OnInit, OnDestroy {

  /**
   * See https://docs.python.org/3/library/logging.html#logging-levels
   */
  levels: string[] = [
    'CRITICAL',
    'ERROR',
    'WARNING',
    'INFO',
    'DEBUG',
    // 'NOTSET'
  ];

  getLogUrl = (type: string) => `http://${window.location.hostname}:60000/${type}/obd.log`

  settings$: Promise<Settings>;
  connection$: Promise<ConnectionParameters>

  constructor(private settingsService: SettingsService, public display: DisplayService) { }

  set(event: MatRadioChange) {
    console.log(event)
  }

  ngOnInit(): void {
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => s.connection);
  }

  ngOnDestroy(): void {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}
