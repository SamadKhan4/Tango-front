import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function createGameSocket() {
  return io(socketUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 600,
    reconnectionDelayMax: 4000,
    timeout: 8000,
    transports: ['websocket', 'polling'],
  });
}

export function emitWithAck(socket, event, payload, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      const error = new Error('The game server is not connected.');
      error.code = 'CONNECTION_LOST';
      reject(error);
      return;
    }
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      const error = new Error('The server did not respond. Try again.');
      error.code = 'REQUEST_TIMEOUT';
      reject(error);
    }, timeoutMs);
    socket.emit(event, payload, (response) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (response?.ok) {
        resolve(response.data);
        return;
      }
      const error = new Error(response?.error?.message || 'The request was not accepted.');
      error.code = response?.error?.code || 'REQUEST_REJECTED';
      reject(error);
    });
  });
}

export function socketBaseUrl() {
  return socketUrl;
}
