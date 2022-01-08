import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html'
})
export class DemoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    sessionStorage.setItem('demo', "seen");
  }

}
