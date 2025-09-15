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
  LoginErrorData,
  JoinRoomData,
  LeaveRoomData,
  RoomJoinedData,
  RoomLeftData,
  RoomErrorData
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
    socket.on('joinRoom', this.handleJoinRoom(socket));
    socket.on('leaveRoom', this.handleLeaveRoom(socket));
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
    socket.data.subscribedRooms = user.subscribedRooms;

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
    socket.data.subscribedRooms = user.subscribedRooms;

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
      // Use the room from the message data if provided, otherwise default to notification room
      const targetRoom = data.room && data.room.trim() !== '' ? data.room.trim() : user.room;
      
      // Check if user is subscribed to the target room
      if (!user.subscribedRooms.includes(targetRoom)) {
        return; // User is not subscribed to this room
      }

      const messageData: MessageData = {
        id: uuidv4(),
        message: data.message,
        username: user.username,
        timestamp: Date.now(),
        room: targetRoom,
      };

      // Send message to all users in the room (including sender)
      socket.to(targetRoom).emit('message', messageData);
      socket.emit('message', messageData);

      console.log(`Message from ${user.username} in ${targetRoom}: ${data.message}`);
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

  private handleJoinRoom = (socket: TypedSocket) => (data: JoinRoomData): void => {
    const { roomName } = data;
    
    if (!roomName || roomName.trim() === '') {
      socket.emit('roomError', { error: 'Room name is required' });
      return;
    }

    const user = this.userService.getUser(socket.id);
    if (!user) {
      socket.emit('roomError', { error: 'User not found' });
      return;
    }

    const success = this.userService.subscribeUserToRoom(socket.id, roomName.trim());
    if (!success) {
      socket.emit('roomError', { 
        error: 'Already subscribed to this room or invalid room', 
        roomName: roomName.trim() 
      });
      return;
    }

    // Join the socket room
    socket.join(roomName.trim());
    
    // Update socket data
    socket.data.subscribedRooms = this.userService.getUserSubscribedRooms(socket.id);

    // Notify user about successful room join
    socket.emit('roomJoined', {
      roomName: roomName.trim(),
      username: user.username,
      message: `Successfully joined room: ${roomName.trim()}`
    });

    // Notify others in the room
    socket.to(roomName.trim()).emit('userJoined', {
      username: user.username,
      room: roomName.trim(),
      timestamp: Date.now(),
    });

    console.log(`${user.username} joined room: ${roomName.trim()}`);
  };

  private handleLeaveRoom = (socket: TypedSocket) => (data: LeaveRoomData): void => {
    const { roomName } = data;
    
    if (!roomName || roomName.trim() === '') {
      socket.emit('roomError', { error: 'Room name is required' });
      return;
    }

    const user = this.userService.getUser(socket.id);
    if (!user) {
      socket.emit('roomError', { error: 'User not found' });
      return;
    }

    const success = this.userService.unsubscribeUserFromRoom(socket.id, roomName.trim());
    if (!success) {
      socket.emit('roomError', { 
        error: 'Not subscribed to this room or cannot leave notification room', 
        roomName: roomName.trim() 
      });
      return;
    }

    // Leave the socket room
    socket.leave(roomName.trim());
    
    // Update socket data
    socket.data.subscribedRooms = this.userService.getUserSubscribedRooms(socket.id);

    // Notify user about successful room leave
    socket.emit('roomLeft', {
      roomName: roomName.trim(),
      username: user.username,
      message: `Successfully left room: ${roomName.trim()}`
    });

    // Notify others in the room
    socket.to(roomName.trim()).emit('userLeft', {
      username: user.username,
      room: roomName.trim(),
      timestamp: Date.now(),
    });

    console.log(`${user.username} left room: ${roomName.trim()}`);
  };
}