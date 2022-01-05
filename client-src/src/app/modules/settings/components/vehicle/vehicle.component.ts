import { Component, Input, OnInit } from '@angular/core';
import { Vehicle } from '../../models/settings.model';

@Component({
  selector: 'settings-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['../../settings.component.scss']
})
export class VehicleComponent implements OnInit {

  @Input() vehicle: Vehicle;

  constructor() { }

  ngOnInit(): void { }

}
