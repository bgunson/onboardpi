import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, last, skip, take, timeout } from 'rxjs/operators';
import { AppSocket, OBDSocket } from 'src/app/app.module';
import { ResponseSet } from '../models/obd.model';

import { OBDService } from './obd.service';
import { of, TimeoutError } from 'rxjs';

describe('OBDService', () => {
  let obd: OBDService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OBDSocket, AppSocket],
      imports: [MatSnackBarModule]
    });
    obd = TestBed.inject(OBDService);
  });

  it('#connect should open obd connection', async () => {
    const connected: boolean = await obd.connect();
    expect(connected).toBeTruthy();
  });

  it('#disconnect should close obd connection', (done: DoneFn) => {
    obd.disconnect();
    obd.isConnected()
      .subscribe((connected: boolean) => {
        expect(connected).toBeFalsy();
        done();
      });
  });

  it('#isConnected should work', (done: DoneFn) => {
    obd.disconnect();
    obd.isConnected().subscribe((connected: boolean) => {
      expect(connected).toBeFalse();
      done();
    });
  });

  it(`#getStatus should work`, (done: DoneFn) => {
    obd.connect().then(() => {
      obd.getStatus().subscribe((status: string) => {
        expect(status).toBe('Car Connected');
        done();
      });
    });
  });

  // TODO: need to fix the watch/unwatch tests to work with new response schema
  // it('#watch should add command to response set', (done: DoneFn) => {
  //   obd.watch(['RPM']);
  //   let rpmFound = false; // Flag to track if 'RPM' is found

  //   obd.getWatching().pipe(
  //     timeout(1000), // Set a timeout for the emissions
  //     catchError(err => {
  //       if (err instanceof TimeoutError) {
  //         return of<ResponseSet>(); // Complete the observable if a timeout occurs
  //       }
  //       throw err; // Rethrow other errors
  //     })
  //   ).subscribe({
  //     next: (res: ResponseSet) => {
  //       if (res['RPM'] !== undefined) {
  //         rpmFound = true; // Set the flag to true if 'RPM' is found
  //       }
  //     },
  //     complete: () => {
  //       expect(rpmFound).toBe(true); // Assert that 'RPM' was found in at least one emission
  //       done();
  //     },
  //     error: (err) => {
  //       done.fail(err);
  //     }
  //   });
  // });

  // it('#unwatch should remove command from response set', (done: DoneFn) => {
  //   obd.watch(['SPEED']);
  //   obd.unwatch(['SPEED']);
  //   let speedFound = false; // Flag to track if 'SPEED' is found

  //   obd.getWatching().pipe(
  //     timeout(1000), // Set a timeout for the emissions
  //     catchError(err => {
  //       if (err instanceof TimeoutError) {
  //         return of<ResponseSet>(); // Complete the observable if a timeout occurs
  //       }
  //       throw err; // Rethrow other errors
  //     })
  //   ).subscribe({
  //     next: (res: ResponseSet) => {
  //       if (res['SPEED'] !== undefined) {
  //         speedFound = true; // Set the flag to true if 'SPEED' is found
  //       }
  //     },
  //     complete: () => {
  //       expect(speedFound).toBe(false); // Assert that 'SPEED' was not found in any emission
  //       done();
  //     },
  //     error: (err) => {
  //       done.fail(err); // Handle any errors
  //     }
  //   });
  // });

  it('#getPortName should have demo port name', (done: DoneFn) => {
    obd.getPortName().then((portName: string) => {
      expect(portName).toBe('/dev/demo/port');
      done();
    })
  });

  it('#getProtocolName should have demo protocol name', (done: DoneFn) => {
    obd.getProtocolName().then((protocolName: string) => {
      expect(protocolName).toBe('DEMO');
      done();
    })
  });

  it('should be created', () => {
    expect(obd).toBeTruthy();
  });

});
