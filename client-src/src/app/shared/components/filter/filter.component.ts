import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'shared-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Output() keyup = new EventEmitter<HTMLInputElement>();
  @Input() size: number;

  style: { [klass: string]: any; } | null;

  constructor() { }

  emitFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement);
    this.keyup.emit(filterValue);
  }

  ngOnInit(): void {
    if (!this.size) {
      this.size = 14
    }
    this.style = {
      'margin-bottom': '-14px',
      'width': '100%',
      'font-size': this.size + 'px'
    }
  }

}
