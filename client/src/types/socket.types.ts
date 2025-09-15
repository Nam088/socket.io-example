export interface ServerToClientEvents {
  message: (data: MessageData) => void;
  notification: (data: NotificationData) => void;
  userJoined: (data: UserJoinedData) => void;
  userLeft: (data: UserLeftData) => void;
  typing: (data: TypingData) => void;
  stopTyping: (data: StopTypingData) => void;
  loginSuccess: (data: LoginSuccessData) => void;
  loginError: (data: LoginErrorData) => void;
}

export interface ClientToServerEvents {
  message: (data: MessageData) => void;
  login: (data: LoginData) => void;
  adminLogin: (data: AdminLoginData) => void;
  adminBroadcast: (data: AdminBroadcastData) => void;
  typing: () => void;
  stopTyping: () => void;
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

export interface LoginData {
  username: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminBroadcastData {
  message: string;
}

export interface LoginSuccessData {
  userId: string;
  username: string;
  room: string;
  isAdmin: boolean;
}

export interface LoginErrorData {
  error: string;
}

export interface NotificationData {
  id: string;
  message: string;
  timestamp: number;
  isAdmin: boolean;
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