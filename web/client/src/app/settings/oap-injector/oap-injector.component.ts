import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Settings } from '../settings.model';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-oap-injector',
  templateUrl: './oap-injector.component.html',
  styleUrls: ['./oap-injector.component.scss', '../settings.component.scss']
})
export class OapInjectorComponent implements OnInit, OnDestroy {

  name = 'oap';
  settings$: Promise<Settings>;
  injectorSettings$: Promise<any>;
  injectorState$: Promise<any>;

  constructor(
    private settingsService: SettingsService,
    private obd: OBDService
  ){ }

  toggleInjector(event: MatSlideToggleChange) {
    if (event.checked) {
      this.obd.enableInjector(this.name);
    } else {
      this.obd.disableInjector(this.name);
    }
    setTimeout(() => this.injectorState$ = this.obd.getInjectorState(this.name), 500);
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

  ngOnInit(): void {
    this.settings$ = this.settingsService.getSettings();
    this.injectorSettings$ = this.settings$.then(s => s['injectors'][this.name]);
    this.injectorState$ = this.obd.getInjectorState(this.name);
  }

  ngOnDestroy() {
    this.settings$.then(s => this.settingsService.updateSettings(s));
  }

}
