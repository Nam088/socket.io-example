import React, { useState, useRef, useEffect } from 'react';
import { MessageData } from '../types/socket.types';
import './ChatRoom.css';

interface ChatRoomProps {
  username: string;
  room: string;
  messages: MessageData[];
  typingUsers: string[];
  onSendMessage: (message: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onLeave: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  username,
  room,
  messages,
  typingUsers,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onLeave
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
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

  const filteredTypingUsers = typingUsers.filter(user => user !== username);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <h2>Room: {room}</h2>
          <p>Welcome, {username}!</p>
        </div>
        <button onClick={onLeave} className="leave-button">
          Leave Room
        </button>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.username === username ? 'own-message' : ''} ${msg.username === 'System' ? 'system-message' : ''}`}
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
          placeholder="Type a message..."
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