import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MenuComponent } from './menu.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CarConnectionComponent } from './car-connection/car-connection.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [MenuComponent, CarConnectionComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    BrowserModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatGridListModule,
    MatCardModule,
    MatRippleModule
  ]
})
export class MenuModule { }
