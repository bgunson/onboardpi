import { Component, OnDestroy, OnInit } from '@angular/core';
import { Protocol } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { ConnectionParameters, Settings } from '../../settings.model';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'obd-connection-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss', '../../settings.component.scss']
})
export class ParametersComponent implements OnInit, OnDestroy {

  protocols$: Promise<Protocol[]>;

  connection$: Promise<ConnectionParameters>;
  settings$: Promise<Settings>;
  delay: number;

  constructor(private settingsService: SettingsService, public display: DisplayService, private obd: OBDService) { }

  ngOnInit(): void {
    this.protocols$ = this.obd.allProtocols();
    this.settings$ = this.settingsService.getSettings();
    this.connection$ = this.settings$.then(s => {
      this.delay = s.connection.parameters.delay_cmds;    // Store the existing value for delay_cmds
      return s.connection;
    });
  }

  ngOnDestroy(): void {
    this.settings$.then(s => {
      if (s.connection.parameters.delay_cmds <= 0) {
        // When user inputs a negative numbver just revert to the orignal value
        s.connection.parameters.delay_cmds = this.delay;
      }
      this.settingsService.updateSettings(s)
    });
  }

}
