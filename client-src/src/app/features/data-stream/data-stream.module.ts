import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { DataStreamComponent } from './data-stream.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { VehicleStreamComponent } from './components/vehicle-stream/vehicle-stream.component';
import { SystemStreamComponent } from './components/system-stream/system-stream.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    DataStreamComponent,
    SystemStreamComponent,
    VehicleStreamComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatIconModule,

    MatFormFieldModule,
    MatInputModule
  ]
})
export class DataStreamModule { }
