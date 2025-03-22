import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import portfinder from 'portfinder';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Start server
const startServer = (port) => {
    server.listen(port, (err) => {
        if (err) {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use. Trying next port...`);
                portfinder.getPortPromise({ port: port + 1 })
                    .then((newPort) => {
                        startServer(newPort);
                    })
                    .catch((err) => {
                        console.error(`No available ports: ${err}`);
                        process.exit(1);
                    });
            } else {
                console.error(`Error starting server: ${err}`);
                process.exit(1);
            }
        } else {
            console.log(`Server running on port ${port}`);
        }
    });
};

const PORT = process.env.PORT || 50000;
startServer(PORT);

const io = new socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ['GET', 'POST'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
        credentials: true
    }
});

const activeGames = {};
let scoreboard = {};

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/scoreboard/:gameCode', (req, res) => {
    const { gameCode } = req.params;
    console.log(`Fetching scoreboard for game ${gameCode}:`, scoreboard[gameCode]);
    if (scoreboard[gameCode]) {
        res.json(scoreboard[gameCode]);
    } else {
        res.status(404).json({ error: 'Game not found' });
    }
});

// Socket.io events
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createGame', ({ gameCode }) => {
        if (!activeGames[gameCode]) {
            activeGames[gameCode] = { 
                players: 0,
                status: 'waiting',
                startTime: null
            };
            scoreboard[gameCode] = [];
            console.log(`Game created: ${gameCode}`);
            socket.join(gameCode);
            socket.emit('gameCreated', { success: true });
            updatePlayerCount(gameCode);
        } else {
            socket.emit('gameCreated', { success: false });
        }
    });

    socket.on('join', ({ gameCode, name }) => {
        if (activeGames[gameCode]) {
            const playerExists = scoreboard[gameCode]?.some(player => player.name === name);
            if (!playerExists) {
                socket.join(gameCode);
                activeGames[gameCode].players += 1;
                scoreboard[gameCode].push({ name: name, score: 0 });
                console.log(`${name} joined game: ${gameCode}, scoreboard:`, scoreboard[gameCode]);
                socket.emit('joinResponse', { valid: true, nameExists: false });
                io.to(gameCode).emit('updateScoreboard', { 
                    name, 
                    score: 0,
                    rankings: calculateRankings(scoreboard[gameCode])
                });
                updatePlayerCount(gameCode);
            } else {
                socket.emit('joinResponse', { valid: true, nameExists: true });
            }
        } else {
            socket.emit('joinResponse', { valid: false, nameExists: false });
        }
    });

    socket.on('startGame', ({ gameCode }) => {
        if (activeGames[gameCode]) {
            activeGames[gameCode].status = 'in_progress';
            activeGames[gameCode].startTime = Date.now();
            io.to(gameCode).emit('startGame', { 
                gameCode,
                initialScores: calculateRankings(scoreboard[gameCode])
            });
        }
    });

    socket.on('finishGame', ({ gameCode, name, score }) => {
        console.log(`Player ${name} finished with score: ${score}`);
        if (!scoreboard[gameCode]) {
            console.error(`Scoreboard for game ${gameCode} not found`);
            return;
        }

        const playerIndex = scoreboard[gameCode].findIndex(player => player.name === name);
        if (playerIndex !== -1) {
            scoreboard[gameCode][playerIndex].score = score;
            io.to(gameCode).emit('updateScoreboard', { 
                name, 
                score,
                rankings: calculateRankings(scoreboard[gameCode])
            });
        }
    });

    socket.on('playerFinished', ({ gameCode }) => {
        if (activeGames[gameCode]) {
            const game = activeGames[gameCode];
            game.playersFinished = (game.playersFinished || 0) + 1;

            // Check if all players finished
            if (game.playersFinished === game.players) {
                game.status = 'completed';
                io.to(gameCode).emit('gameComplete', {
                    finalScores: calculateRankings(scoreboard[gameCode]),
                    gameDuration: Date.now() - game.startTime
                });
            }
        }
    });
});

function updatePlayerCount(gameCode) {
    const count = activeGames[gameCode]?.players || 0;
    console.log(`Updating player count for game ${gameCode}: ${count}`);
    io.to(gameCode).emit('updatePlayerCount', { count });
}

function calculateRankings(scores) {
    return scores
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
            ...player,
            rank: index + 1
        }));
}