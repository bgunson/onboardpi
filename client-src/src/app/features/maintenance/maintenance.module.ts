import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceComponent } from './maintenance.component';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { RecordFormComponent } from './components/record-form/record-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaintenanceRoutingModule } from './maintenance-routing.module';



@NgModule({
  declarations: [MaintenanceComponent, RecordFormComponent],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatSortModule,
    MatProgressSpinnerModule
  ]
})
export class MaintenanceModule { }
