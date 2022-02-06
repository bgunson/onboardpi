import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezeDataComponent } from './freeze-data.component';

describe('FreezeDataComponent', () => {
  let component: FreezeDataComponent;
  let fixture: ComponentFixture<FreezeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezeDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
