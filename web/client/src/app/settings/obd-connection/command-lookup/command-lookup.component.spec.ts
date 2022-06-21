import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandLookupComponent } from './command-lookup.component';

describe('CommandLookupComponent', () => {
  let component: CommandLookupComponent;
  let fixture: ComponentFixture<CommandLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandLookupComponent ]
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
