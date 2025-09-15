export interface ServerToClientEvents {
  message: (data: MessageData) => void;
  userJoined: (data: UserJoinedData) => void;
  userLeft: (data: UserLeftData) => void;
  typing: (data: TypingData) => void;
  stopTyping: (data: StopTypingData) => void;
}

export interface ClientToServerEvents {
  message: (data: MessageData) => void;
  join: (data: JoinData) => void;
  leave: (data: LeaveData) => void;
  typing: () => void;
  stopTyping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  room: string;
}

export interface MessageData {
  id: string;
  message: string;
  username: string;
  timestamp: number;
  room: string;
}

export interface JoinData {
  username: string;
  room: string;
}

export interface LeaveData {
  room: string;
}

export interface UserJoinedData {
  username: string;
  room: string;
  timestamp: number;
}

export interface UserLeftData {
  username: string;
  room: string;
  timestamp: number;
}

export interface TypingData {
  username: string;
  room: string;
}

export interface StopTypingData {
  username: string;
  room: string;
}