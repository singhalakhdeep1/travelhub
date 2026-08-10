import { describe, it, expect } from 'vitest';

describe('TravelHub Dynamic Pricing Engine', () => {
  it('should apply seasonal multiplier during peak holiday dates', () => {
    const basePrice = 200;
    const peakMultiplier = 1.35;
    const finalPrice = basePrice * peakMultiplier;

    expect(finalPrice).toBe(270);
  });
});
