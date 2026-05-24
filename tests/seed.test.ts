import { describe, it, expect, beforeEach } from 'bun:test';
import { _resetSingletonForTests } from '../server/db';
import { seedFromCurated } from '../server/seed';

describe('seedFromCurated', () => {
  beforeEach(() => {
    _resetSingletonForTests();
  });

  it('seeds curated + official banks on an empty DB and is idempotent', () => {
    const first = seedFromCurated();
    expect(first.wasEmpty).toBe(true);
    expect(first.insertedSeed).toBeGreaterThan(50);
    expect(first.insertedOfficial).toBeGreaterThan(20);
    expect(first.total).toBe(first.insertedSeed + first.insertedOfficial);

    const second = seedFromCurated();
    expect(second.wasEmpty).toBe(false);
    expect(second.insertedSeed).toBe(0);
    expect(second.insertedOfficial).toBe(0);
    expect(second.total).toBe(first.total);
  });
});
