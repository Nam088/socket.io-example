import React, { useState, useRef, useEffect } from 'react';
import { MessageData, NotificationData, LoginSuccessData } from '../types/socket.types';
import './ChatRoom.css';

interface ChatRoomProps {
  user: LoginSuccessData;
  messages: MessageData[];
  notifications: NotificationData[];
  typingUsers: string[];
  subscribedRooms: string[];
  currentRoom: string;
  roomError: string | null;
  onSendMessage: (message: string, targetRoom?: string) => void;
  onAdminBroadcast: (message: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onJoinRoom: (roomName: string) => void;
  onLeaveRoom: (roomName: string) => void;
  onSwitchRoom: (roomName: string) => void;
  onLogout: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  user,
  messages,
  notifications,
  typingUsers,
  subscribedRooms,
  currentRoom,
  roomError,
  onSendMessage,
  onAdminBroadcast,
  onStartTyping,
  onStopTyping,
  onJoinRoom,
  onLeaveRoom,
  onSwitchRoom,
  onLogout
}) => {
  const [message, setMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, notifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), currentRoom);
      setMessage('');
      handleStopTyping();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastMessage.trim() && user.isAdmin) {
      onAdminBroadcast(broadcastMessage.trim());
      setBroadcastMessage('');
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim() && !subscribedRooms.includes(newRoomName.trim())) {
      onJoinRoom(newRoomName.trim());
      setNewRoomName('');
    }
  };

  const filteredTypingUsers = typingUsers.filter(typingUser => typingUser !== user.username);

  // Filter messages for current room
  const currentRoomMessages = messages.filter(msg => msg.room === currentRoom);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <h2>Current Room: {currentRoom}</h2>
          <p>Welcome, {user.username}! {user.isAdmin && '(Admin)'}</p>
          <p>User ID: {user.userId}</p>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Room Management */}
      <div className="room-management">
        <div className="subscribed-rooms">
          <h3>Subscribed Rooms</h3>
          <div className="room-list">
            {subscribedRooms.map((room) => (
              <div key={room} className={`room-item ${room === currentRoom ? 'active' : ''}`}>
                <button 
                  onClick={() => onSwitchRoom(room)}
                  className="room-button"
                  disabled={room === currentRoom}
                >
                  {room}
                </button>
                {room !== 'notifications' && (
                  <button 
                    onClick={() => onLeaveRoom(room)}
                    className="leave-room-button"
                    title="Leave room"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="join-room">
          <h3>Join New Room</h3>
          <form onSubmit={handleJoinRoom} className="join-room-form">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name..."
              className="room-input"
            />
            <button type="submit" disabled={!newRoomName.trim()} className="join-button">
              Join
            </button>
          </form>
          {roomError && <div className="room-error">{roomError}</div>}
        </div>
      </div>

      {user.isAdmin && (
        <div className="admin-panel">
          <h3>Admin Broadcast</h3>
          <form onSubmit={handleBroadcast} className="broadcast-form">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter broadcast message..."
              className="broadcast-input"
            />
            <button type="submit" disabled={!broadcastMessage.trim()} className="broadcast-button">
              Broadcast
            </button>
          </form>
        </div>
      )}

      <div className="messages-container">
        {/* Display notifications only in notifications room */}
        {currentRoom === 'notifications' && notifications.map((notification) => (
          <div key={notification.id} className="notification-message">
            <div className="notification-header">
              <span className="notification-label">
                {notification.isAdmin ? '📢 Admin Broadcast' : '📣 Notification'}
              </span>
              <span className="timestamp">{formatTime(notification.timestamp)}</span>
            </div>
            <div className="notification-content">{notification.message}</div>
          </div>
        ))}

        {/* Display regular messages for current room */}
        {currentRoomMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.username === user.username ? 'own-message' : ''} ${msg.username === 'System' ? 'system-message' : ''}`}
          >
            <div className="message-header">
              <span className="username">{msg.username}</span>
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        
        {filteredTypingUsers.length > 0 && (
          <div className="typing-indicator">
            {filteredTypingUsers.join(', ')} {filteredTypingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onBlur={handleStopTyping}
          placeholder={`Type a message in ${currentRoom}...`}
          className="message-input"
          autoFocus
        />
        <button type="submit" disabled={!message.trim()} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};