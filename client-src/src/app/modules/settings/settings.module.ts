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
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConnectionParametersComponent } from './components/connection-parameters/connection-parameters.component';
import {MatRadioModule} from '@angular/material/radio';



@NgModule({
  declarations: [SettingsComponent, ConnectionParametersComponent ],
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
    MatProgressSpinnerModule,
    MatRippleModule,
    MatRadioModule
  ]
})
export class SettingsModule { }
