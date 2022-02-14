import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDResponse } from 'src/app/shared/models/obd.model';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Sensor } from '../../dashboard.model';
import { DashboardService } from '../../dashboard.service';


@Component({
  selector: 'dashboard-numeric',
  templateUrl: './numeric.component.html',
  styleUrls: ['../../dashboard.component.scss']
})
export class NumericComponent implements OnInit {

  @Input() card: Sensor;
  
  live$: Observable<OBDResponse>;

  constructor(
    public dashboardService: DashboardService,
    private obd: OBDService, 
  ) { }

  ngOnInit(): void {
    this.live$ = this.obd.getWatching().pipe(pluck(this.card.command));
  }

}
