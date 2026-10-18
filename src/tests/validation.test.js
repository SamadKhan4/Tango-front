import { describe, expect, it } from 'vitest';
import { normalizeRoomCode, validateDisplayName, validateJoinForm } from '../utils/validation.js';

describe('Bingo form validation', () => {
  it('normalizes a valid room code', () => {
    expect(normalizeRoomCode(' ab c234 ')).toBe('ABC234');
    expect(validateJoinForm({ name: 'Riya', roomCode: 'ab c234' }).data).toEqual({ name: 'Riya', roomCode: 'ABC234' });
  });

  it('rejects invalid room codes and names', () => {
    expect(validateJoinForm({ name: '', roomCode: 'ABC123' }).success).toBe(false);
    expect(validateJoinForm({ name: 'Riya', roomCode: 'IL0000' }).success).toBe(false);
    expect(validateDisplayName('A name with !').success).toBe(false);
    expect(validateDisplayName('A'.repeat(25)).success).toBe(false);
  });
});
