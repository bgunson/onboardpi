import { Component, OnDestroy, OnInit } from '@angular/core';
import { Protocol } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { ConnectionParameters, Settings } from '../settings.model';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'settings-connection-parameters',
  templateUrl: './connection-parameters.component.html',
  styleUrls: ['./connection-parameters.component.scss', '../settings.component.scss']
})
export class ConnectionParametersComponent implements OnInit, OnDestroy {

  protocols$: Promise<Protocol[]>;

  connection$: Promise<ConnectionParameters>;
  settings$: Promise<Settings>;

  constructor(private settingsService: SettingsService, public display: DisplayService, private obd: OBDService) { }

  ngOnInit(): void {
    this.protocols$ = this.obd.allProtocols();
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => s.connection);
  }

  ngOnDestroy(): void {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}
