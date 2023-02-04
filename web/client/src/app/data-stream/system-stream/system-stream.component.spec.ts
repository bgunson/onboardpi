import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';
import { SystemStreamComponent } from './system-stream.component';


describe('SystemStreamComponent', () => {
  let component: SystemStreamComponent;
  let fixture: ComponentFixture<SystemStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemStreamComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ AppSocket, OBDSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
