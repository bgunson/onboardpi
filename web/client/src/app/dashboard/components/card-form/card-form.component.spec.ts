import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { CardFormComponent } from './card-form.component';

describe('CardFormComponent', () => {
  let component: CardFormComponent;
  let fixture: ComponentFixture<CardFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardFormComponent ],
      imports: [ MatSnackBarModule, MatDialogModule, FormsModule ],
      providers: [
        OBDSocket, 
        AppSocket, 
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFormComponent);
    component = fixture.componentInstance;
    component.card = {
      id: undefined,
      index: -1,
      type: 'curve',
      command: 'RPM'
    };
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
