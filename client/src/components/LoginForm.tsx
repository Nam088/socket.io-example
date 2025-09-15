import React, { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (username: string) => void;
  onAdminLogin: (username: string, password: string) => void;
  isConnected: boolean;
  loginError: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onAdminLogin, 
  isConnected, 
  loginError 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && isConnected) {
      if (isAdminMode) {
        onAdminLogin(username.trim(), password);
      } else {
        onLogin(username.trim());
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login to Chat</h1>
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
          
          <div className="admin-toggle">
            <input
              type="checkbox"
              id="adminMode"
              checked={isAdminMode}
              onChange={(e) => setIsAdminMode(e.target.checked)}
            />
            <label htmlFor="adminMode">Admin Login</label>
          </div>

          {isAdminMode && (
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={!username.trim() || !isConnected || (isAdminMode && !password)}
            className="login-button"
          >
            {isConnected ? (isAdminMode ? 'Admin Login' : 'Login') : 'Connecting...'}
          </button>
        </form>

        {loginError && (
          <div className="error-message">
            {loginError}
          </div>
        )}

        <div className="connection-status">
          Status: <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="info">
          <p>• Regular users: just enter username</p>
          <p>• Admin users: username "admin", password "1"</p>
        </div>
      </div>
    </div>
  );
};