import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { LogLevelComponent } from './obd-connection/log-level/log-level.component';
import { ParametersComponent } from './obd-connection/parameters/parameters.component';
import { CommandsComponent } from './obd-connection/commands/commands.component';
import { SharedModule } from '../shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';



@NgModule({
  declarations: [
    SettingsComponent,
    ParametersComponent,
    LogLevelComponent,
    CommandsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
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
    MatRadioModule,
    MatExpansionModule,
    MatAutocompleteModule
  ]
})
export class SettingsModule { }
