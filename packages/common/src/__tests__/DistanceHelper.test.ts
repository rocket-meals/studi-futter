import { calculateDistanceInMeter } from 'repo-depkit-common';

describe('calculateDistanceInMeter', () => {
  it('returns a precise distance for long ranges', () => {
    const berlin = [13.4050, 52.5200];
    const losAngeles = [-118.2437, 34.0522];

    const distance = calculateDistanceInMeter(berlin, losAngeles);
    const expected = 9309675; // approximate distance in meters
    const tolerance = 1000; // allow 1 km difference

    expect(Math.abs(distance - expected)).toBeLessThanOrEqual(tolerance);
  });
});
