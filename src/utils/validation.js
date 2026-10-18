import { z } from 'zod';

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a display name.')
  .max(24, 'Use 24 characters or fewer.')
  .regex(/^[\p{L}\p{N} _.'-]+$/u, 'Use letters, numbers, spaces, apostrophes, periods, or hyphens only.');

export const roomCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase().replace(/\s/g, ''))
  .pipe(z.string().regex(/^[A-HJ-NP-Z2-9]{6}$/, 'Enter the six-character room code.'));

export function validateDisplayName(value) {
  return displayNameSchema.safeParse(value);
}

export function validateJoinForm({ name, roomCode }) {
  return z.object({ name: displayNameSchema, roomCode: roomCodeSchema }).safeParse({ name, roomCode });
}

export function normalizeRoomCode(value = '') {
  return value.trim().toUpperCase().replace(/\s/g, '');
}
