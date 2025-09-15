import { Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData,
  MessageData,
  LoginData,
  AdminLoginData,
  AdminBroadcastData,
  NotificationData,
  LoginSuccessData,
  LoginErrorData
} from '../types/socket.types';
import { UserService } from '../services/user.service';
import { v4 as uuidv4 } from 'uuid';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export class SocketController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  handleConnection = (socket: TypedSocket): void => {
    console.log(`User connected: ${socket.id}`);

    socket.on('login', this.handleLogin(socket));
    socket.on('adminLogin', this.handleAdminLogin(socket));
    socket.on('adminBroadcast', this.handleAdminBroadcast(socket));
    socket.on('message', this.handleMessage(socket));
    socket.on('typing', this.handleTyping(socket));
    socket.on('stopTyping', this.handleStopTyping(socket));
    socket.on('disconnect', this.handleDisconnect(socket));
  };

  private handleLogin = (socket: TypedSocket) => (data: LoginData): void => {
    const { username } = data;
    
    if (!username || username.trim() === '') {
      socket.emit('loginError', { error: 'Username is required' });
      return;
    }

    // Regular user login (not admin)
    const user = this.userService.addUser(socket.id, username.trim(), false);
    const room = this.userService.getNotificationRoom();
    
    // Join the notification room
    socket.join(room);
    
    // Store user data in socket
    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.room = user.room;
    socket.data.isAdmin = user.isAdmin;

    // Send login success
    const loginSuccess: LoginSuccessData = {
      userId: user.id,
      username: user.username,
      room: user.room,
      isAdmin: user.isAdmin
    };
    socket.emit('loginSuccess', loginSuccess);

    // Notify others in the room that user joined
    socket.to(room).emit('userJoined', {
      username: user.username,
      room: user.room,
      timestamp: Date.now(),
    });

    console.log(`${username} logged in and joined notification room`);
  };

  private handleAdminLogin = (socket: TypedSocket) => (data: AdminLoginData): void => {
    const { username, password } = data;
    
    if (!this.userService.validateAdminLogin(username, password)) {
      socket.emit('loginError', { error: 'Invalid admin credentials' });
      return;
    }

    // Admin login
    const user = this.userService.addUser(socket.id, username, true);
    const room = this.userService.getNotificationRoom();
    
    // Join the notification room
    socket.join(room);
    
    // Store user data in socket
    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.room = user.room;
    socket.data.isAdmin = user.isAdmin;

    // Send login success
    const loginSuccess: LoginSuccessData = {
      userId: user.id,
      username: user.username,
      room: user.room,
      isAdmin: user.isAdmin
    };
    socket.emit('loginSuccess', loginSuccess);

    // Notify others that admin joined
    socket.to(room).emit('userJoined', {
      username: user.username,
      room: user.room,
      timestamp: Date.now(),
    });

    console.log(`Admin ${username} logged in`);
  };

  private handleAdminBroadcast = (socket: TypedSocket) => (data: AdminBroadcastData): void => {
    const user = this.userService.getUser(socket.id);
    if (!user || !user.isAdmin) {
      return; // Only admin can broadcast
    }

    const notification: NotificationData = {
      id: uuidv4(),
      message: data.message,
      timestamp: Date.now(),
      isAdmin: true
    };

    const room = this.userService.getNotificationRoom();
    // Send notification to all users in the notification room
    socket.to(room).emit('notification', notification);
    socket.emit('notification', notification);

    console.log(`Admin broadcast: ${data.message}`);
  };

  private handleMessage = (socket: TypedSocket) => (data: MessageData): void => {
    const user = this.userService.getUser(socket.id);
    if (user) {
      const messageData: MessageData = {
        id: uuidv4(),
        message: data.message,
        username: user.username,
        timestamp: Date.now(),
        room: user.room,
      };

      // Send message to all users in the room (including sender)
      socket.to(user.room).emit('message', messageData);
      socket.emit('message', messageData);

      console.log(`Message from ${user.username} in ${user.room}: ${data.message}`);
    }
  };

  private handleTyping = (socket: TypedSocket) => (): void => {
    const user = this.userService.getUser(socket.id);
    if (user) {
      socket.to(user.room).emit('typing', {
        username: user.username,
        room: user.room,
      });
    }
  };

  private handleStopTyping = (socket: TypedSocket) => (): void => {
    const user = this.userService.getUser(socket.id);
    if (user) {
      socket.to(user.room).emit('stopTyping', {
        username: user.username,
        room: user.room,
      });
    }
  };

  private handleDisconnect = (socket: TypedSocket) => (): void => {
    const user = this.userService.removeUser(socket.id);
    if (user) {
      socket.to(user.room).emit('userLeft', {
        username: user.username,
        room: user.room,
        timestamp: Date.now(),
      });

      console.log(`User disconnected: ${user.username}`);
    }
  };
}