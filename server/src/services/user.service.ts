import { User, Room } from '../types/user.types';

export class UserService {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();

  addUser(socketId: string, username: string, room: string): User {
    const user: User = {
      id: socketId,
      username,
      room,
      joinedAt: Date.now(),
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

  getRoom(roomName: string): Room | null {
    return this.rooms.get(roomName) || null;
  }
}