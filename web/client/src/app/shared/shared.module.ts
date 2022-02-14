import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BytesPipe, ElapsedPipe, OBDValuePipe, PrettyUnitPipe, RoundPipe } from './pipes/format_pipes';
import { FilterComponent } from './components/filter/filter.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe,
    OBDValuePipe,
    FilterComponent,
    ElapsedPipe
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  exports: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe,
    OBDValuePipe,
    FilterComponent,
    ElapsedPipe
  ],
  providers: [DecimalPipe]
})
export class SharedModule { }
