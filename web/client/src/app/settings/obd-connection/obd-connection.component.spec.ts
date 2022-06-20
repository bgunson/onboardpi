import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OBDConnectionComponent } from './obd-connection.component';


describe('OBDConnectionComponent', () => {
  let component: OBDConnectionComponent;
  let fixture: ComponentFixture<OBDConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OBDConnectionComponent ]
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
