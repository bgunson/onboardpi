import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OBDCommandsComponent } from './obd-commands.component';

describe('OBDCommandsComponent', () => {
  let component: OBDCommandsComponent;
  let fixture: ComponentFixture<OBDCommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OBDCommandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OBDCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
