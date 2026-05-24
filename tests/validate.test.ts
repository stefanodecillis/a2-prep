import { describe, it, expect } from 'bun:test';
import { isWellFormedQuestion } from '../server/validate';

const ok = {
  id: 'q1',
  questionText: 'Ho __________ un caffè.',
  options: ['preso', 'prendere', 'prendo'],
  correctAnswerIndex: 0,
  explanation: 'Passato prossimo.',
  difficulty: 'A2',
};

describe('isWellFormedQuestion', () => {
  it('accepts a complete question', () => {
    expect(isWellFormedQuestion(ok)).toBe(true);
  });

  it('rejects missing id', () => {
    expect(isWellFormedQuestion({ ...ok, id: '' })).toBe(false);
  });

  it('rejects empty options array', () => {
    expect(isWellFormedQuestion({ ...ok, options: [] })).toBe(false);
  });

  it('rejects out-of-range correctAnswerIndex (too high)', () => {
    expect(isWellFormedQuestion({ ...ok, correctAnswerIndex: 3 })).toBe(false);
  });

  it('rejects out-of-range correctAnswerIndex (negative)', () => {
    expect(isWellFormedQuestion({ ...ok, correctAnswerIndex: -1 })).toBe(false);
  });

  it('rejects non-integer correctAnswerIndex', () => {
    expect(isWellFormedQuestion({ ...ok, correctAnswerIndex: 1.5 })).toBe(false);
  });

  it('rejects non-string option values', () => {
    expect(isWellFormedQuestion({ ...ok, options: ['a', '', 'c'] })).toBe(false);
    expect(isWellFormedQuestion({ ...ok, options: ['a', 2, 'c'] })).toBe(false);
  });

  it('rejects whitespace-only questionText', () => {
    expect(isWellFormedQuestion({ ...ok, questionText: '   ' })).toBe(false);
  });

  it('rejects null / undefined', () => {
    expect(isWellFormedQuestion(null)).toBe(false);
    expect(isWellFormedQuestion(undefined)).toBe(false);
  });
});
