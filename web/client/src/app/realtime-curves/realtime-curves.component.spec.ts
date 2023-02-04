import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from '../app.module';

import { RealtimeCurvesComponent } from './realtime-curves.component';

describe('RealtimeCurvesComponent', () => {
  let component: RealtimeCurvesComponent;
  let fixture: ComponentFixture<RealtimeCurvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealtimeCurvesComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ OBDSocket, AppSocket ]
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
