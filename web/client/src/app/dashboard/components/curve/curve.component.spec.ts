import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { CurveComponent } from './curve.component';

describe('DashboardCurveComponent', () => {
  let component: CurveComponent;
  let fixture: ComponentFixture<CurveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurveComponent ],
      imports: [ MatSnackBarModule, MatDialogModule ],
      providers: [ OBDSocket, AppSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurveComponent);
    component = fixture.componentInstance;
    component.card = {
      id: 0,
      index: 0, 
      type: 'curve',
      command: 'RPM'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
