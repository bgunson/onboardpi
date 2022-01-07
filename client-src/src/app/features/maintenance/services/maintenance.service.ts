import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSocket } from 'src/app/app.module';
import { CrudService } from 'src/app/shared/services/crud.service';
import { MaintenanceRecord } from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  private _records$: Observable<MaintenanceRecord[]>;

  constructor(private crud: CrudService, private socket: AppSocket) { }
  
  getRecords() {
    this.crud.read<MaintenanceRecord[]>('maintenance');
    if (!this._records$) {
      this._records$ = this.socket.fromEvent<any>('maintenance:response');
    }
    return this._records$;
  }

  createRecord(record: MaintenanceRecord) {
    this.crud.create<MaintenanceRecord>('maintenance', record);
  }

  updateRecord(record: MaintenanceRecord) {
    this.crud.update<MaintenanceRecord>('maintenance', record);
  }

  deleteRecord(record: MaintenanceRecord) {
    this.crud.delete<MaintenanceRecord>('maintenance', record);
  }

}
