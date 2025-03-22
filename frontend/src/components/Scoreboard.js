import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

const Scoreboard = () => {
    const { gameCode } = useParams();
    const [scoreboard, setScoreboard] = useState([]);
    const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'in_progress', 'completed'

    useEffect(() => {
        // Fetch the initial scoreboard data from the server
        fetch(`${process.env.REACT_APP_BACKEND_URL}/scoreboard/${gameCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Initial scoreboard data:', data);
                setScoreboard(data);
            })
            .catch(error => console.error('Error fetching scoreboard:', error));

        // Listen for the updateScoreboard event to update the scoreboard in real-time
        socket.on('updateScoreboard', ({ name, score, rankings }) => {
            console.log('Received score update:', { name, score, rankings });
            setScoreboard(prevScoreboard => {
                const updatedScoreboard = [...prevScoreboard];
                const playerIndex = updatedScoreboard.findIndex(player => player.name === name);
                if (playerIndex !== -1) {
                    updatedScoreboard[playerIndex].score = score;
                } else {
                    updatedScoreboard.push({ name, score });
                }
                return updatedScoreboard.sort((a, b) => b.score - a.score);
            });
            setGameStatus('in_progress');
        });

        // Listen for game completion
        socket.on('gameComplete', ({ finalScores, gameDuration }) => {
            console.log('Game completed:', { finalScores, gameDuration });
            setScoreboard(finalScores);
            setGameStatus('completed');
        });

        return () => {
            socket.off('updateScoreboard');
            socket.off('gameComplete');
        };
    }, [gameCode]);

    // Sort players by score
    const sortedScoreboard = [...scoreboard].sort((a, b) => b.score - a.score);

    return (
        <div className="flex flex-col items-center bg-[#D680FF] bg-opacity-70 rounded-lg p-8 w-full max-w-3xl text-center space-y-6">
            <h1 className="font-august text-4xl md:text-5xl text-white mb-4">Scoreboard</h1>
            
            {/* Game Status */}
            <div className="text-white text-xl mb-6">
                {gameStatus === 'waiting' && 'Waiting for players to start...'}
                {gameStatus === 'in_progress' && 'Game in progress...'}
                {gameStatus === 'completed' && 'Game completed!'}
            </div>

            {/* All Players */}
            <div className="w-full space-y-4">
                {sortedScoreboard.length === 0 ? (
                    <div className="text-white text-xl">No players have joined yet</div>
                ) : (
                    sortedScoreboard.map((player, index) => (
                        <div
                            key={player.name}
                            className={`
                                font-bold px-8 py-4 rounded-lg shadow-md
                                ${index === 0 ? 'bg-[#d4af37] text-white text-4xl md:text-5xl' : ''}
                                ${index === 1 ? 'bg-[#c5c9c7] text-white text-3xl md:text-4xl' : ''}
                                ${index === 2 ? 'bg-[#a97142] text-white text-2xl md:text-3xl' : ''}
                                ${index > 2 ? 'bg-[#1f262a] text-white text-xl md:text-2xl' : ''}
                            `}
                        >
                            {index + 1}. {player.name} - {player.score} points
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Scoreboard;
