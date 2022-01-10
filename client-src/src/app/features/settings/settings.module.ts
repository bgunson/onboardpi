import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import { ConnectionParametersComponent } from './components/connection-parameters/connection-parameters.component';
import { LogLevelComponent } from './components/log-level/log-level.component';



@NgModule({
  declarations: [
    SettingsComponent,
    ConnectionParametersComponent,
    LogLevelComponent
  ],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    AppRoutingModule,
    MatIconModule,
    FormsModule,
    MatListModule,
    MatCardModule,
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
