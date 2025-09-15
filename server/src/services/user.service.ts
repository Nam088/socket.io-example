import { User, Room } from '../types/user.types';
import { v4 as uuidv4 } from 'uuid';

const NOTIFICATION_ROOM = 'notifications';

export class UserService {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();

  addUser(socketId: string, username: string, isAdmin: boolean = false): User {
    const user: User = {
      id: uuidv4(), // Generate unique UUID for each user per tab
      username,
      room: NOTIFICATION_ROOM, // All users join the notification room
      joinedAt: Date.now(),
      isAdmin,
      subscribedRooms: [NOTIFICATION_ROOM], // Start with notification room subscription
    };

    this.users.set(socketId, user);
    this.addUserToRoom(user);
    return user;
  }

  removeUser(socketId: string): User | null {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
      this.removeUserFromRoom(user);
      return user;
    }
    return null;
  }

  getUser(socketId: string): User | null {
    return this.users.get(socketId) || null;
  }

  getUsersInRoom(roomName: string): User[] {
    return Array.from(this.users.values()).filter(user => user.room === roomName);
  }

  private addUserToRoom(user: User): void {
    let room = this.rooms.get(user.room);
    if (!room) {
      room = {
        id: user.room,
        name: user.room,
        users: [],
        createdAt: Date.now(),
      };
      this.rooms.set(user.room, room);
    }
    
    const existingUserIndex = room.users.findIndex(u => u.id === user.id);
    if (existingUserIndex === -1) {
      room.users.push(user);
    }
  }

  private removeUserFromRoom(user: User): void {
    const room = this.rooms.get(user.room);
    if (room) {
      room.users = room.users.filter(u => u.id !== user.id);
      if (room.users.length === 0) {
        this.rooms.delete(user.room);
      }
    }
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  validateAdminLogin(username: string, password: string): boolean {
    return username === 'admin' && password === '1';
  }

  getNotificationRoom(): string {
    return NOTIFICATION_ROOM;
  }

  getRoom(roomName: string): Room | null {
    return this.rooms.get(roomName) || null;
  }

  subscribeUserToRoom(socketId: string, roomName: string): boolean {
    const user = this.users.get(socketId);
    if (!user) {
      return false;
    }

    // Don't allow subscribing to the same room twice
    if (user.subscribedRooms.includes(roomName)) {
      return false;
    }

    // Add room to user's subscribed rooms
    user.subscribedRooms.push(roomName);

    // Create a temporary user object for this room subscription
    const roomUser: User = { ...user, room: roomName };
    this.addUserToRoom(roomUser);

    return true;
  }

  unsubscribeUserFromRoom(socketId: string, roomName: string): boolean {
    const user = this.users.get(socketId);
    if (!user) {
      return false;
    }

    // Don't allow unsubscribing from notification room
    if (roomName === NOTIFICATION_ROOM) {
      return false;
    }

    // Remove room from user's subscribed rooms
    const roomIndex = user.subscribedRooms.indexOf(roomName);
    if (roomIndex === -1) {
      return false;
    }

    user.subscribedRooms.splice(roomIndex, 1);

    // Remove user from the room
    const roomUser: User = { ...user, room: roomName };
    this.removeUserFromRoom(roomUser);

    return true;
  }

  getUserSubscribedRooms(socketId: string): string[] {
    const user = this.users.get(socketId);
    return user ? user.subscribedRooms : [];
  }
}