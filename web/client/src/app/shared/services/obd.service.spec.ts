import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { last, skip, take } from 'rxjs/operators';
import { AppSocket, OBDSocket } from 'src/app/app.module';
import { ResponseSet } from '../models/obd.model';

import { OBDService } from './obd.service';

describe('OBDService', () => {
  let obd: OBDService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ OBDSocket, AppSocket ],
      imports: [ MatSnackBarModule ]
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

  it('#watch should add command to reponse set', (done: DoneFn) => {
    obd.watch(['RPM']);
    obd.getWatching().pipe(take(1)).subscribe((res: ResponseSet) => {
      expect(res['RPM']).toBeDefined();
      done();
    });
  });

  it('#unwatch should remove commadn from response set', (done: DoneFn) => {
    obd.watch(['SPEED']);
    obd.unwatch(['SPEED']);
    obd.getWatching().pipe(take(1)).subscribe((res: ResponseSet) => {
      expect(res['SPEED']).toBeUndefined();
      done();
    });
  });

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
