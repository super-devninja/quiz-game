// src/socket.js
import {io} from 'socket.io-client';

const BACKEND_URL = 'https://quiz-game-gx5f.onrender.com' ;

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
