import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { NumericComponent } from './numeric.component';

describe('NumericComponent', () => {
  let component: NumericComponent;
  let fixture: ComponentFixture<NumericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumericComponent ],
      imports: [ MatDialogModule, MatSnackBarModule ],
      providers: [ OBDSocket, AppSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericComponent);
    component = fixture.componentInstance;
    component.card = {
      id: 0,
      index: 0,
      type: 'numeric',
      command: 'RPM'
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
