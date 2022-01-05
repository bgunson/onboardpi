import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticsComponent } from './diagnostics.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [DiagnosticsComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ]
})
export class DiagnosticsModule { }
