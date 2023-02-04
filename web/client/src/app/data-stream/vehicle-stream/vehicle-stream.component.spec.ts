import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';
import { VehicleStreamComponent } from './vehicle-stream.component';


describe('VehicleStreamComponent', () => {
  let component: VehicleStreamComponent;
  let fixture: ComponentFixture<VehicleStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleStreamComponent ],
      providers: [ OBDSocket, AppSocket ],
      imports: [ MatSnackBarModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
