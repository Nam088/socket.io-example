import React, { useState } from 'react';
import './JoinForm.css';

interface JoinFormProps {
  onJoin: (username: string, room: string) => void;
  isConnected: boolean;
}

export const JoinForm: React.FC<JoinFormProps> = ({ onJoin, isConnected }) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && room.trim() && isConnected) {
      onJoin(username.trim(), room.trim());
    }
  };

  return (
    <div className="join-container">
      <div className="join-form">
        <h1>Join Chat Room</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="room">Room:</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={!username.trim() || !room.trim() || !isConnected}
            className="join-button"
          >
            {isConnected ? 'Join Room' : 'Connecting...'}
          </button>
        </form>
        <div className="connection-status">
          Status: <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};