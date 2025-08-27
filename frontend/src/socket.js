import { io } from 'socket.io-client';

const socket = io('http://localhost:8000/', {
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;