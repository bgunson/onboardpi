import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { CarConnectionComponent } from './car-connection.component';

describe('CarConnectionComponent', () => {
  let component: CarConnectionComponent;
  let fixture: ComponentFixture<CarConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarConnectionComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ OBDSocket, AppSocket ]
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
