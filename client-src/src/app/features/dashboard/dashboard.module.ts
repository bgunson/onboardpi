import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DashboardComponent } from './dashboard.component';
import { NgxGaugeModule } from 'ngx-gauge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { GaugeComponent } from './components/gauge/gauge.component';
import { NumericComponent } from './components/numeric/numeric.component';
import { CurveComponent } from './components/curve/curve.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CardFormComponent } from './components/card-form/card-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { RealtimeChartModule } from 'ngx-graph';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';



@NgModule({
  declarations: [DashboardComponent, GaugeComponent, NumericComponent, CurveComponent, CardFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatCardModule,
    NgxGaugeModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatSelectModule,
    MatProgressBarModule,
    RealtimeChartModule
  ],
})
export class DashboardModule { }
