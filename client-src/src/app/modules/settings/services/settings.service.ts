import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { AppSocket } from 'src/app/app.module';
import { CrudService } from 'src/app/services/socket/crud.service';
import { Settings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private crud: CrudService, private socket: AppSocket) { }

  getSettings() {
    this.crud.read<Settings>('settings');
    return this.socket.fromOneTimeEvent<Settings>('settings:response');
  }

  updateSettings(updated: Settings) {
    this.socket.emit('settings:update', updated);
  }
}
