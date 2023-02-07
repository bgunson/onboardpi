import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../shared/services/display.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {

  constructor(public display: DisplayService) { }

  ngOnInit(): void {
    sessionStorage.setItem('demo', "seen");
  }

}
