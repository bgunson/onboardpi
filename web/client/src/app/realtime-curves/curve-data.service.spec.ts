import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSocket, OBDSocket } from '../app.module';

import { CurveDataService } from './curve-data.service';

describe('CurveDataService', () => {
  let service: CurveDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MatSnackBarModule ],
      providers: [ OBDSocket, AppSocket ]
    });
    service = TestBed.inject(CurveDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
