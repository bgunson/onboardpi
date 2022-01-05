import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { ConnectionComponent } from './components/connection/connection.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { VehicleComponent } from './components/vehicle/vehicle.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [SettingsComponent, ConnectionComponent, VehicleComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    AppRoutingModule,
    MatIconModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatRippleModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ]
})
export class SettingsModule { }
