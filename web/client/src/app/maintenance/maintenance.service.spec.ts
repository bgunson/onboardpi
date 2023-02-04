import { TestBed } from '@angular/core/testing';
import { AppSocket } from '../app.module';

import { MaintenanceService } from './maintenance.service';

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ AppSocket ]
    });
    service = TestBed.inject(MaintenanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
