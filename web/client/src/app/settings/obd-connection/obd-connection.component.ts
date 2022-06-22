import { Component, OnDestroy, OnInit } from '@angular/core';
import { Protocol } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Connection, Settings } from '../settings.model';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'settings-obd-connection',
  templateUrl: './obd-connection.component.html',
  styleUrls: ['./obd-connection.component.scss', '../settings.component.scss']
})
export class OBDConnectionComponent implements OnInit, OnDestroy {

  protocols$: Promise<Protocol[]>;
  settings$: Promise<Settings>;
  delay: number;
  connection: Connection;
  baudrates: number[] = [9600, 38400, 19200, 57600, 115200];
  availablePorts$: Promise<string[]>;

  supportedOnly: boolean;

  constructor(private settingsService: SettingsService, public display: DisplayService, private obd: OBDService) { }

  async ngOnInit() {
    this.availablePorts$ = this.obd.getAvailablePorts();
    this.protocols$ = this.obd.allProtocols();
    this.settings$ = this.settingsService.getSettings();
    this.connection = (await this.settings$).connection;
    this.delay = this.connection.parameters.delay_cmds;
    this.supportedOnly = this.settingsService.getUserSetting('supportedOnly') ? this.settingsService.getUserSetting('supportedOnly') === "true" : false;
  }

  ngOnDestroy(): void {
    this.settingsService.updateUserSetting('supportedOnly', this.supportedOnly);
    this.settings$.then(s => {
      if (s.connection.parameters.delay_cmds <= 0) {
        // When user inputs a negative numbver just revert to the orignal value
        s.connection.parameters.delay_cmds = this.delay;
      }
      if (s.connection.parameters.portstr?.trim() === "") {
        s.connection.parameters.portstr = null;
      }
      this.settingsService.updateSettings(s)
    });
  }

}
