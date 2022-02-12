import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticsComponent } from './diagnostics.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { FreezeDataComponent } from './freeze-data/freeze-data.component';
import { MatRippleModule } from '@angular/material/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [DiagnosticsComponent, FreezeDataComponent],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatRippleModule
  ]
})
export class DiagnosticsModule { }
