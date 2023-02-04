import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { OapInjectorComponent } from './oap-injector.component';

describe('OapInjectorComponent', () => {
  let component: OapInjectorComponent;
  let fixture: ComponentFixture<OapInjectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OapInjectorComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ AppSocket, OBDSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OapInjectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
