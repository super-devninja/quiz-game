// src/socket.js
import {io} from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:50000';

const socket = io(BACKEND_URL, {
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
    transports: ['websocket', 'polling'],
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('connect', () => {
    console.log('Connected to server');
});

export default socket;
