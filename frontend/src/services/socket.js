import { io } from 'socket.io-client';
import { ROOT_URL } from './api';

const SOCKET_URL = ROOT_URL || 'http://localhost:5000';
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});
