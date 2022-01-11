import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'shared-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Output() keyup = new EventEmitter<string>();
  @Input() size: number;
  @Input() placeholder: string;
  @Input() label: string;

  style: { [klass: string]: any; } | null;

  value = '';

  constructor() { }

  emitFilter(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.keyup.emit(this.value);
  }

  clearFilter() {
    this.value = '';
    this.keyup.emit('');
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
