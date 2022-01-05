import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDResponse } from 'src/app/models/obd.model';
import { FormatService } from 'src/app/services/format.service';
import { OBDService } from 'src/app/services/socket/obd.service';
import { DashboardCard } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';


@Component({
  selector: 'dashboard-numeric',
  templateUrl: './numeric.component.html',
  styleUrls: ['../../dashboard.component.scss']
})
export class NumericComponent implements OnInit {

  @Input() card: DashboardCard;
  
  live$: Observable<OBDResponse>;

  constructor(
    public dashboardService: DashboardService,
    private obd: OBDService, 
    public format: FormatService
  ) { }

  ngOnInit(): void {
    this.live$ = this.obd.getWatching().pipe(pluck(this.card.command));
  }

}
