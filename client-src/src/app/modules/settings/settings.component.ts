import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DisplayService } from 'src/app/services/display.service';
import { ActionService } from 'src/app/services/action.service';
import { Settings } from './models/settings.model';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {


  isDarkTheme: boolean;
  settings$: Observable<Settings>;
  settings: Settings;

  constructor(
    private display: DisplayService,
    private settingsService: SettingsService,
    private action: ActionService
  ) { }

  switchTheme() {
    this.display.setTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  saveSettings = () => {
    console.log("Settings action invoked", this.settings);
  }

  ngOnInit(): void {
    this.settingsService.getSettings().pipe(take(1)).subscribe(s => this.settings = s);
    this.isDarkTheme = this.display.theme == 'dark';
  }

  ngOnDestroy() {
    this.settingsService.updateSettings(this.settings);
  }

}
