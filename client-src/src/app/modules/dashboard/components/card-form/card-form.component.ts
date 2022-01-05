import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OBDCommand } from 'src/app/models/obd.model';
import { OBDService } from 'src/app/services/socket/obd.service';
import { DashboardCard } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';

interface DialogData {
  new?: boolean;
  card: DashboardCard;
}

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent implements OnInit {

  card: DashboardCard;

  cardTypes = {
    'Gauge - Full': 'gauge.full',
    'Gauge - Arch': 'gauge.arch',
    'Gauge - Semi': 'gauge.semi',
    'Curve': 'curve',
    'Numeric': 'numeric'
  }

  commands$: Promise<OBDCommand[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private obd: OBDService,
    private dashboardService: DashboardService
  ) { }

  removeCard() {
    this.dashboardService.deleteCard(this.card);
  }

  onSubmit() {
    if (this.data.new) {
      this.dashboardService.addCard(this.card);
    } else {
      this.dashboardService.updateCard(this.card);
    }
  }

  ngOnInit(): void {
    this.card = this.data.card;
    this.commands$ = this.obd.allCommands().then(all => all[1]);
  }

}
