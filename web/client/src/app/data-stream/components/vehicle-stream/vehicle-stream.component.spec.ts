import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleStreamComponent } from './vehicle-stream.component';


describe('VehicleComponent', () => {
  let component: VehicleStreamComponent;
  let fixture: ComponentFixture<VehicleStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleStreamComponent ]
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
