import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';
import { OBDConnectionComponent } from './obd-connection.component';


describe('OBDConnectionComponent', () => {
  let component: OBDConnectionComponent;
  let fixture: ComponentFixture<OBDConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OBDConnectionComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ AppSocket, OBDSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OBDConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
