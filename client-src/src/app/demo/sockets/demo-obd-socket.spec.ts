import { DemoOBDSocket } from "./demo-obd-socket";

describe('DemoSocket', () => {
  it('should create an instance', () => {
    expect(new DemoOBDSocket({})).toBeTruthy();
  });
});
