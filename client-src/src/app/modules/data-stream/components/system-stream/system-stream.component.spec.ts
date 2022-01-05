import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemStreamComponent } from './system-stream.component';


describe('SystemStreamComponent', () => {
  let component: SystemStreamComponent;
  let fixture: ComponentFixture<SystemStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemStreamComponent ]
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
