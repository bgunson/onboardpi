import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionParametersComponent } from './connection-parameters.component';

describe('ConnectionParametersComponent', () => {
  let component: ConnectionParametersComponent;
  let fixture: ComponentFixture<ConnectionParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
