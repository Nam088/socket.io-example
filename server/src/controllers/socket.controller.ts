import { Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData,
  MessageData,
  JoinData,
  LeaveData 
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

    socket.on('join', this.handleJoin(socket));
    socket.on('leave', this.handleLeave(socket));
    socket.on('message', this.handleMessage(socket));
    socket.on('typing', this.handleTyping(socket));
    socket.on('stopTyping', this.handleStopTyping(socket));
    socket.on('disconnect', this.handleDisconnect(socket));
  };

  private handleJoin = (socket: TypedSocket) => (data: JoinData): void => {
    const { username, room } = data;
    
    // Add user to the service
    const user = this.userService.addUser(socket.id, username, room);
    
    // Join the socket room
    socket.join(room);
    
    // Store user data in socket
    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.room = user.room;

    // Notify others in the room that user joined
    socket.to(room).emit('userJoined', {
      username: user.username,
      room: user.room,
      timestamp: Date.now(),
    });

    console.log(`${username} joined room: ${room}`);
  };

  private handleLeave = (socket: TypedSocket) => (data: LeaveData): void => {
    const user = this.userService.getUser(socket.id);
    if (user) {
      socket.leave(data.room);
      this.userService.removeUser(socket.id);
      
      socket.to(data.room).emit('userLeft', {
        username: user.username,
        room: user.room,
        timestamp: Date.now(),
      });

      console.log(`${user.username} left room: ${data.room}`);
    }
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