import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BytesPipe, OBDValuePipe, PrettyUnitPipe, RoundPipe } from './pipes/format_pipes';



@NgModule({
  declarations: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe,
    OBDValuePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe,
    OBDValuePipe
  ],
  providers: [DecimalPipe]
})
export class SharedModule { }
