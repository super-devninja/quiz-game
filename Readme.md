# Emily Quiz Application

A real-time multiplayer quiz game where players can test their knowledge about Emily. The game features a host-player model where one person hosts the game and others can join using a game code.

## Features

- Real-time multiplayer gameplay
- Host and player roles
- Dynamic scoring system
- Live scoreboard updates
- Multiple question categories with different point values
- Responsive design for all devices

## Project Structure

```
emily-quiz/
├── backend/               # Backend server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env             # Backend environment variables
└── frontend/             # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── utils/        # Utility functions
    │   └── socket.js     # Socket.io client setup
    ├── package.json      # Frontend dependencies
    └── .env             # Frontend environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emily-quiz
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the backend directory:
   ```
   PORT=50000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_BACKEND_URL=http://localhost:50000
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```
   The server will run on port 50000 by default.

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on port 3000 and automatically open in your default browser.

## How to Play

1. **As a Host:**
   - Click "Spiel erstellen" on the welcome screen
   - Click "Create Game" to get a game code
   - Share the game code with players
   - Wait for players to join
   - Click "Start Game" when ready

2. **As a Player:**
   - Click "Spiel beitreten" on the welcome screen
   - Enter your name and the game code
   - Wait for the host to start the game
   - Answer questions to earn points
   - View your ranking on the scoreboard

## Game Flow

1. Host creates a game and gets a unique game code
2. Players join using the game code
3. Host starts the game when all players are ready
4. Players answer questions from different categories
5. Live scoreboard updates as players answer questions
6. Final results shown when all players finish

## Troubleshooting

- If the backend port 50000 is in use, the server will automatically try the next available port
- Check the browser console (F12) for any error messages
- Ensure both frontend and backend servers are running
- Verify the environment variables are set correctly

## Development

- Backend uses Express.js and Socket.io for real-time communication
- Frontend uses React with Socket.io client
- Styling uses Tailwind CSS for responsive design
- State management uses React hooks
