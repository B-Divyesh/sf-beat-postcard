import { describe, expect, it } from 'vitest';
import { decodePostcard, encodePostcard, generatedTempo, scoreAttempt, type Note } from '../src/pattern';

describe('postcard links', () => {
  it('round-trips a call and reply without changing their order', () => {
    const call: Note[] = [0, 1, 2, 3, 3, 2, 1, 0];
    const reply: Note[] = [3, 0, 2, 1, 0, 3, 1, 2];
    expect(decodePostcard(encodePostcard({ version: 1, tempo: 108, call, reply }))).toEqual({ version: 1, tempo: 108, call, reply });
  });

  it('rejects truncated, unknown, and out-of-range links', () => {
    expect(decodePostcard('v1-30-0123')).toBeNull();
    expect(decodePostcard('v2-30-01230123')).toBeNull();
    expect(decodePostcard('v1-99-01230123')).toBeNull();
    expect(decodePostcard('v1-30-01234123')).toBeNull();
  });

  it('keeps generated tempos on the documented six-step range', () => {
    expect(generatedTempo(-1)).toBe(96);
    expect(generatedTempo(0.5)).toBe(108);
    expect(generatedTempo(1)).toBe(116);
  });
});

describe('copy scoring', () => {
  const expected: Note[] = [0, 1, 2, 3, 0, 1, 2, 3];

  it('requires both the right sound and a hit inside the timing window', () => {
    expect(scoreAttempt(expected, [0, 1, 2, 3, 0, 1, 2, 3], [0, 20, -20, 239, 240, 241, 0, 0], 240)).toEqual([
      true, true, true, true, true, false, true, true,
    ]);
    expect(scoreAttempt(expected, [1, 1, 2, 3, 0, 1, 2, null], Array(8).fill(0), 240)).toEqual([
      false, true, true, true, true, true, true, false,
    ]);
  });
});
