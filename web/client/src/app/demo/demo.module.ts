import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { DemoComponent } from './demo.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    DemoComponent
  ],
  imports: [
    CommonModule,
    DemoRoutingModule,
    MatButtonModule
  ]
})
export class DemoModule { }
