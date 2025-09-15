import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  MessageData,
  LoginData,
  AdminLoginData,
  LoginSuccessData,
  LoginErrorData,
  NotificationData,
  UserJoinedData,
  UserLeftData,
  TypingData 
} from '../types/socket.types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [user, setUser] = useState<LoginSuccessData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('loginSuccess', (data: LoginSuccessData) => {
      setUser(data);
      setLoginError(null);
      console.log('Login successful:', data);
    });

    newSocket.on('loginError', (data: LoginErrorData) => {
      setLoginError(data.error);
      console.log('Login error:', data.error);
    });

    newSocket.on('notification', (data: NotificationData) => {
      setNotifications(prev => [...prev, data]);
    });

    newSocket.on('message', (data: MessageData) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('userJoined', (data: UserJoinedData) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        message: `${data.username} joined the room`,
        username: 'System',
        timestamp: data.timestamp,
        room: data.room
      }]);
    });

    newSocket.on('userLeft', (data: UserLeftData) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        message: `${data.username} left the room`,
        username: 'System',
        timestamp: data.timestamp,
        room: data.room
      }]);
    });

    newSocket.on('typing', (data: TypingData) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    newSocket.on('stopTyping', (data: TypingData) => {
      setTypingUsers(prev => prev.filter(user => user !== data.username));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const login = useCallback((data: LoginData) => {
    if (socket) {
      setLoginError(null);
      socket.emit('login', data);
    }
  }, [socket]);

  const adminLogin = useCallback((data: AdminLoginData) => {
    if (socket) {
      setLoginError(null);
      socket.emit('adminLogin', data);
    }
  }, [socket]);

  const adminBroadcast = useCallback((message: string) => {
    if (socket && user?.isAdmin) {
      socket.emit('adminBroadcast', { message });
    }
  }, [socket, user]);

  const logout = useCallback(() => {
    setUser(null);
    setMessages([]);
    setNotifications([]);
    setLoginError(null);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socket) {
      socket.emit('message', {
        id: '',
        message,
        username: '',
        timestamp: Date.now(),
        room: ''
      });
    }
  }, [socket]);

  const startTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing');
    }
  }, [socket]);

  const stopTyping = useCallback(() => {
    if (socket) {
      socket.emit('stopTyping');
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    messages,
    notifications,
    typingUsers,
    user,
    loginError,
    login,
    adminLogin,
    adminBroadcast,
    logout,
    sendMessage,
    startTyping,
    stopTyping
  };
};