import { TestBed } from '@angular/core/testing';
import { AppSocket } from 'src/app/app.module';

import { CrudService } from './crud.service';

describe('CrudService', () => {
  let service: CrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ AppSocket ]
    });
    service = TestBed.inject(CrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
