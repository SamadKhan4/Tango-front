const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function getPublicRoom(roomCode, signal) {
  const response = await fetch(`${apiBaseUrl}/api/rooms/${encodeURIComponent(roomCode)}`, { signal });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error?.message || 'Unable to load this room.');
    error.code = payload?.error?.code || 'ROOM_REQUEST_FAILED';
    throw error;
  }
  return payload.data;
}
