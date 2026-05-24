import { describe, it, expect } from 'bun:test';
import { shuffleArray } from '../src/data/questions';

describe('shuffleArray', () => {
  it('preserves length', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const out = shuffleArray(input);
    expect(out.length).toBe(input.length);
  });

  it('contains the same elements', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const out = shuffleArray(input);
    expect([...out].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    shuffleArray(input);
    expect(input).toEqual(snapshot);
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });

  // Sanity check distribution: across many trials, each element should land
  // in each position roughly the same number of times. With n=4 and trials=4000,
  // expected count per cell is 1000; allow a generous tolerance band.
  it('produces a roughly uniform distribution across positions', () => {
    const n = 4;
    const trials = 4000;
    const counts = Array.from({ length: n }, () => new Array(n).fill(0));
    const base = Array.from({ length: n }, (_, i) => i);
    for (let t = 0; t < trials; t++) {
      const shuffled = shuffleArray(base);
      for (let pos = 0; pos < n; pos++) counts[shuffled[pos]][pos]++;
    }
    const expected = trials / n;
    // Allow ±25% from the expected mean — wide enough to never flake on a
    // fair shuffle, tight enough to catch the old `0.5 - Math.random()` bias
    // which skews the last position heavily.
    for (let v = 0; v < n; v++) {
      for (let pos = 0; pos < n; pos++) {
        expect(counts[v][pos]).toBeGreaterThan(expected * 0.75);
        expect(counts[v][pos]).toBeLessThan(expected * 1.25);
      }
    }
  });
});
