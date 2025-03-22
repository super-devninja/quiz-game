import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const JoinScreen = () => {
    const [name, setName] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for join response
        socket.on('joinResponse', ({ valid, nameExists }) => {
            if (valid && !nameExists) {
                console.log('Joined game successfully.');
                setHasJoined(true);
                setIsWaiting(true);
            } else if (!valid) {
                alert('Invalid game code.');
            } else if (nameExists) {
                alert('Name already exists in this game.');
            }
        });

        // Listen for game start
        socket.on('startGame', ({ gameCode }) => {
            console.log('Game is starting!');
            navigate(`/game/${gameCode}/${name}`);
        });

        return () => {
            socket.off('joinResponse');
            socket.off('startGame');
        };
    }, [navigate, name]);

    const handleJoinGame = () => {
        if (!name || !gameCode) {
            alert('Please enter your name and the game code.');
            return;
        }

        // Convert game code to uppercase to match host's code
        const upperGameCode = gameCode.toUpperCase();
        setGameCode(upperGameCode);
        socket.emit('join', { gameCode: upperGameCode, name });
        localStorage.setItem('playerName', name);
    };

    return (
        <div className="flex flex-col items-center bg-[#D680FF] bg-opacity-70 rounded-lg p-10 w-full max-w-3xl text-center space-y-8">
            <h1 className="font-august text-4xl md:text-6xl text-white">Spiel beitreten</h1>

            {isWaiting ? (
                <div className="text-center">
                    <h2 className="text-white text-2xl mb-4">Successfully joined!</h2>
                    <p className="text-white text-xl">Waiting for host to start the game...</p>
                    <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                </div>
            ) : (
                <>
                    <input
                        className="bg-white text-[#30193A] placeholder-black text-xl md:text-2xl px-6 py-3 rounded-lg w-full max-w-xs"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        className="bg-white text-[#30193A] placeholder-black text-xl md:text-2xl px-6 py-3 rounded-lg w-full max-w-xs"
                        placeholder="Spiel Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                    />

                    <button
                        className="bg-[#D680FF] text-white text-lg md:text-xl px-6 py-3 rounded-lg opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={handleJoinGame}
                    >
                        Beitreten
                    </button>
                </>
            )}
        </div>
    );
};

export default JoinScreen;