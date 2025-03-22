import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const HostScreen = () => {
    const [gameCode, setGameCode] = useState('');
    const [playerCount, setPlayerCount] = useState(0);
    const [playersFinished, setPlayersFinished] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [showGameCode, setShowGameCode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Log initial connection status
        console.log('HostScreen mounted, socket connected:', socket.connected);

        socket.on('gameCreated', ({ success }) => {
            console.log('Received gameCreated event:', { success, gameCode });
            if (success) {
                console.log(`Game created successfully with code: ${gameCode}`);
                setShowGameCode(true);
            } else {
                console.error('Failed to create game');
                alert('Failed to create game. Please try again.');
            }
        });

        socket.on('updatePlayerCount', ({ count }) => {
            console.log('Player count updated:', count);
            setPlayerCount(count);
        });

        socket.on('updatePlayersFinished', ({ count }) => {
            setPlayersFinished(prevPlayersFinished => {
                const newCount = prevPlayersFinished + count;
                console.log('✅ Received updatePlayersFinished:', newCount);
                return newCount;
            });
        });

        socket.on('startGame', ({ gameCode, initialScores }) => {
            console.log('Game starting, navigating to scoreboard with scores:', initialScores);
            setGameStarted(true);
            navigate(`/scoreboard/${gameCode}`);
        });

        return () => {
            console.log('HostScreen unmounting, cleaning up socket listeners');
            socket.off('gameCreated');
            socket.off('updatePlayerCount');
            socket.off('updatePlayersFinished');
            socket.off('startGame');
        };
    }, [gameCode, navigate]);

    const handleCreateGame = () => {
        const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log('Creating new game with code:', newGameCode);
        setGameCode(newGameCode);
        socket.emit('createGame', { gameCode: newGameCode });
    };

    const handleStartGame = () => {
        console.log('Attempting to start game:', { gameCode, playerCount });
        if (playerCount > 0) {
            console.log('Starting game with code:', gameCode);
            socket.emit('startGame', { gameCode });
        } else {
            console.log('Cannot start game - no players joined');
            alert('Wait for players to join before starting the game');
        }
    };

    return (
        <div className="flex flex-col items-center bg-[#D680FF] bg-opacity-70 rounded-lg p-10 w-full max-w-3xl text-center space-y-8">
            <h1 className="font-august text-4xl md:text-6xl text-white">Host Game</h1>

            {!showGameCode ? (
                <button
                    className="bg-[#D680FF] text-white text-lg md:text-xl px-6 py-3 rounded-lg opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={handleCreateGame}
                >
                    Create Game
                </button>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white text-[#30193A] text-4xl md:text-5xl font-bold px-8 py-4 rounded-lg shadow-md">
                        {gameCode}
                    </div>
                    
                    <div className="text-white text-2xl">
                        <p>Share this code with players!</p>
                        <p className="mt-4">Players connected: {playerCount}</p>
                    </div>

                    {showGameCode && !gameStarted && (
                        <button
                            className={`
                                bg-[#D680FF] text-white text-lg md:text-xl px-6 py-3 rounded-lg
                                transition-all duration-300 shadow-md hover:shadow-lg
                                ${playerCount > 0 ? 'opacity-80 hover:opacity-100 hover:scale-105' : 'opacity-50 cursor-not-allowed'}
                            `}
                            onClick={handleStartGame}
                            disabled={playerCount === 0}
                        >
                            {playerCount > 0 ? 'Start Game' : 'Waiting for Players...'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default HostScreen;
