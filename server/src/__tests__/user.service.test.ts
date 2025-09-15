import { UserService } from '../services/user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('addUser', () => {
    it('should add a user successfully', () => {
      const user = userService.addUser('socket123', 'testuser', 'testroom');
      
      expect(user).toMatchObject({
        id: 'socket123',
        username: 'testuser',
        room: 'testroom',
      });
      expect(user.joinedAt).toBeGreaterThan(0);
    });

    it('should create a room when adding first user', () => {
      userService.addUser('socket123', 'testuser', 'newroom');
      const room = userService.getRoom('newroom');
      
      expect(room).not.toBeNull();
      expect(room?.name).toBe('newroom');
      expect(room?.users).toHaveLength(1);
    });
  });

  describe('removeUser', () => {
    it('should remove user successfully', () => {
      userService.addUser('socket123', 'testuser', 'testroom');
      const removedUser = userService.removeUser('socket123');
      
      expect(removedUser).toMatchObject({
        id: 'socket123',
        username: 'testuser',
        room: 'testroom',
      });
      
      const user = userService.getUser('socket123');
      expect(user).toBeNull();
    });

    it('should return null for non-existent user', () => {
      const removedUser = userService.removeUser('nonexistent');
      expect(removedUser).toBeNull();
    });
  });

  describe('getUsersInRoom', () => {
    it('should return users in specific room', () => {
      userService.addUser('socket1', 'user1', 'room1');
      userService.addUser('socket2', 'user2', 'room1');
      userService.addUser('socket3', 'user3', 'room2');
      
      const usersInRoom1 = userService.getUsersInRoom('room1');
      expect(usersInRoom1).toHaveLength(2);
      expect(usersInRoom1.map(u => u.username)).toContain('user1');
      expect(usersInRoom1.map(u => u.username)).toContain('user2');
    });

    it('should return empty array for empty room', () => {
      const users = userService.getUsersInRoom('emptyroom');
      expect(users).toEqual([]);
    });
  });

  describe('getRooms', () => {
    it('should return all rooms', () => {
      userService.addUser('socket1', 'user1', 'room1');
      userService.addUser('socket2', 'user2', 'room2');
      
      const rooms = userService.getRooms();
      expect(rooms).toHaveLength(2);
      expect(rooms.map(r => r.name)).toContain('room1');
      expect(rooms.map(r => r.name)).toContain('room2');
    });
  });
});