import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarConnectionComponent } from './car-connection.component';

describe('CarConnectionComponent', () => {
  let component: CarConnectionComponent;
  let fixture: ComponentFixture<CarConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarConnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
