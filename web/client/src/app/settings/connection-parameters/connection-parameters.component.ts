import { Component, OnDestroy, OnInit } from '@angular/core';
import { DisplayService } from 'src/app/shared/services/display.service';
import { ConnectionParameters, Settings } from '../settings.model';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'settings-connection-parameters',
  templateUrl: './connection-parameters.component.html',
  styleUrls: ['./connection-parameters.component.scss', '../settings.component.scss']
})
export class ConnectionParametersComponent implements OnInit, OnDestroy {

  protocols = {
    '1': 'SAE J1850 PWM',
    '2': 'SAE J1850 VPW',
    '3' : 'AUTO, ISO 9141-2',
    '4': 'ISO 14230-4 (KWP 5BAUD)',
    '5': 'ISO 14230-4 (KWP FAST)',
    '6': 'ISO 15765-4 (CAN 11/500)',
    '7': 'ISO 15765-4 (CAN 29/500)',
    '8': 'ISO 15765-4 (CAN 11/250)',
    '9': 'ISO 15765-4 (CAN 29/250)',
    'A': 'SAE J1939 (CAN 29/250)'
  }

  connection$: Promise<ConnectionParameters>;
  settings$: Promise<Settings>;

  constructor(private settingsService: SettingsService, public display: DisplayService) { }

  ngOnInit(): void {
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => s.connection);
  }

  ngOnDestroy(): void {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}
