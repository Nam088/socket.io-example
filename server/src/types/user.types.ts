export interface User {
  id: string;
  username: string;
  room: string;
  joinedAt: number;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  createdAt: number;
}