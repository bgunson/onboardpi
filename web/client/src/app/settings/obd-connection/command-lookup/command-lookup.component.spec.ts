import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from 'src/app/app.module';

import { CommandLookupComponent } from './command-lookup.component';

describe('CommandLookupComponent', () => {
  let component: CommandLookupComponent;
  let fixture: ComponentFixture<CommandLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandLookupComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ OBDSocket, AppSocket ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
