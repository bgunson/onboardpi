import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeChartModule } from 'ngx-graph';
import { RealtimeCurvesComponent } from './realtime-curves.component';
import {MatSelectModule} from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [RealtimeCurvesComponent],
  imports: [
    CommonModule,
    RealtimeChartModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class RealtimeCurvesModule { }
