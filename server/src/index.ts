import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData 
} from './types/socket.types';
import { SocketController } from './controllers/socket.controller';
import { UserService } from './services/user.service';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Socket.IO setup
const io = new SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Services
const userService = new UserService();
const socketController = new SocketController(userService);

// Socket.IO connection handling
io.on('connection', socketController.handleConnection);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoint to get rooms
app.get('/api/rooms', (req, res) => {
  const rooms = userService.getRooms();
  res.json(rooms);
});

// API endpoint to get users in a room
app.get('/api/rooms/:roomName/users', (req, res) => {
  const { roomName } = req.params;
  const users = userService.getUsersInRoom(roomName);
  res.json(users);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export { app, server, io };