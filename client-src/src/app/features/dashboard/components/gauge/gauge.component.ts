import { Component, Input, OnInit } from '@angular/core';
import { NgxGaugeType } from 'ngx-gauge/gauge/gauge';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDResponse } from 'src/app/shared/models/obd.model';
import { OBDService } from 'src/app/shared/services/obd.service';
import { DashboardCard } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';

export const GAUGE_CONFIG: {[cmd: string]: any} = {

  'RPM': {
      min: 0,
      max: 8000,
      thresholds: {
          '0': {color: 'goldenrod'},
          '6000': {color: 'red'},
      } 
  },
  'THROTTLE_POS': {
      thresholds: {
          '0': {color: 'green'},
          '33': {color: 'goldenrod'},
          '50': {color: 'orange'},
          '66': {color: 'red'},
      } 
  },
  'SPEED': {
      min: 0,
      max: 180,
      type: 'arch',
  }

}

@Component({
  selector: 'dashboard-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: [ '../../dashboard.component.scss']
})
export class GaugeComponent implements OnInit {

  @Input() card: DashboardCard;

  live$: Observable<OBDResponse>;

  gaugeType: NgxGaugeType;   // default

  min: number;
  max: number;
  thresholds: any;

  constructor(private obd: OBDService, public dashboardService: DashboardService) { }

  getSize() {
    if (this.gaugeType === 'arch') {
      return (this.dashboardService.rowHeight * 2) - 25
    } else if (this.gaugeType === 'full') {
      return (this.dashboardService.rowHeight * 2) - 45
    } else {
      return (this.dashboardService.rowHeight * 2) - 20;
    }
  }

  ngOnInit(): void {

    this.min = GAUGE_CONFIG[this.card.command] ? (GAUGE_CONFIG[this.card.command].min || 0) : 0;
    this.max = GAUGE_CONFIG[this.card.command] ? (GAUGE_CONFIG[this.card.command].max || 100) : 100;
    this.thresholds = GAUGE_CONFIG[this.card.command] ? (GAUGE_CONFIG[this.card.command].thresholds || {}) : {};


    this.live$ = this.obd.getWatching().pipe(pluck(this.card.command));

    this.gaugeType = this.card.type.split('.')[1] == 'semi' ? 'semi' 
                   : this.card.type.split('.')[1] == 'full' ? 'full'
                   : this.card.type.split('.')[1] == 'arch' ? 'arch' : 'semi';
  }

}
