import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../shared/services/display.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html'
})
export class DemoComponent implements OnInit {

  constructor(public display: DisplayService) { }

  ngOnInit(): void {
    sessionStorage.setItem('demo', "seen");
  }

}
