import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStreamComponent } from './data-stream.component';

describe('DataStreamComponent', () => {
  let component: DataStreamComponent;
  let fixture: ComponentFixture<DataStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataStreamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
