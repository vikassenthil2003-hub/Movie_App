import { io } from 'socket.io-client';

// Determine the WebSocket server address:
// In local dev, connecting directly to http://localhost:5000 avoids Vite proxy HTTP-polling disconnect issues.
// Can also be overridden with VITE_SOCKET_URL environment variable.
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'], // Prefer native WebSocket, fall back to polling
});

socket.on('connect', () => {
  console.log(`[CineVerse Socket.IO] Connected to real-time server (${socket.id}) at ${getSocketUrl()}`);
});

socket.on('connect_error', (error) => {
  console.warn(`[CineVerse Socket.IO] Connection warning: ${error.message}. Reconnecting...`);
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Reconnect manually if server disconnected socket explicitly
    socket.connect();
  }
});

// Cleanly close connection when page unloads or refreshes to prevent abrupt socket resets
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
}

export default socket;
