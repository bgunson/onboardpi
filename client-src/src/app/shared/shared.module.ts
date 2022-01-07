import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BytesPipe, PrettyUnitPipe, RoundPipe } from './pipes/format_pipes';



@NgModule({
  declarations: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BytesPipe,
    PrettyUnitPipe,
    RoundPipe
  ]
})
export class SharedModule { }
