import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { GaugeComponent } from './gauge.component';

describe('DashboardGaugeComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GaugeComponent ],
      imports: [ MatSnackBarModule, MatDialogModule ],
      providers: [ OBDSocket, AppSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    component.card = {
      id: 0,
      index: 0, 
      type: 'gauge.arch',
      command: 'RPM'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
