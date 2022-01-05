import { TestBed } from '@angular/core/testing';

import { OBDService } from './obd.service';

describe('OBDService', () => {
  let service: OBDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OBDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
