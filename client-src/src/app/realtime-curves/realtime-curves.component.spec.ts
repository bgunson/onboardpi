import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeCurvesComponent } from './realtime-curves.component';

describe('RealtimeCurvesComponent', () => {
  let component: RealtimeCurvesComponent;
  let fixture: ComponentFixture<RealtimeCurvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealtimeCurvesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeCurvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
