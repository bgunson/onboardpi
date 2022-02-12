import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaintenanceRecord } from '../maintenance.model';
import { MaintenanceService } from '../maintenance.service';

interface DialogData {
  record?: MaintenanceRecord
}


@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent implements OnInit {

  record: MaintenanceRecord = {
    date: new Date(),
    description: "",
    notes: ""
  };

  isUpdate: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private maintenacneService: MaintenanceService
  ) { }

  onSubmit() {
    if (this.isUpdate) {
      this.maintenacneService.updateRecord(this.record);
    } else {
      this.maintenacneService.createRecord(this.record);
    }
  }

  ngOnInit(): void {
    if (this.data && this.data.record) {
      this.record = this.data.record;
      this.isUpdate = true;
    }
  }
}
