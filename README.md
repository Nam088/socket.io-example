# Socket.IO Chat Application

A real-time chat application built with Socket.IO, featuring a TypeScript server using Express and a React client with modern UI.

## Features

- **Real-time messaging** with Socket.IO
- **Multiple chat rooms** support
- **Typing indicators** to show when users are typing
- **User join/leave notifications**
- **Modern React UI** with responsive design
- **TypeScript** for type safety on both client and server
- **Comprehensive testing** setup
- **ESLint** for code quality

## Project Structure

```
├── server/                 # Express + Socket.IO server
│   ├── src/
│   │   ├── controllers/    # Socket event handlers
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   ├── __tests__/      # Unit tests
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .eslintrc.js
├── client/                 # React client application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── main.tsx        # Client entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── eslint.config.js
├── package.json            # Root package.json for workspace
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for all workspaces:

```bash
npm install
```

### Development

Start both server and client in development mode:

```bash
npm run dev
```

This will start:
- Server on `http://localhost:3001`
- Client on `http://localhost:3000`

### Individual Commands

**Server only:**
```bash
npm run dev:server
```

**Client only:**
```bash
npm run dev:client
```

### Production Build

Build both applications:

```bash
npm run build
```

### Testing

Run tests for both server and client:

```bash
npm test
```

### Linting

Run ESLint on both applications:

```bash
npm run lint
```

## Server API

The server provides the following REST endpoints:

- `GET /health` - Health check
- `GET /api/rooms` - Get all active rooms
- `GET /api/rooms/:roomName/users` - Get users in a specific room

## Socket.IO Events

### Client to Server

- `join` - Join a chat room
- `leave` - Leave a chat room  
- `message` - Send a message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator

### Server to Client

- `message` - Receive a message
- `userJoined` - User joined the room
- `userLeft` - User left the room
- `typing` - User started typing
- `stopTyping` - User stopped typing

## Technology Stack

### Server
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Helmet** - Security middleware
- **CORS** - Cross-origin support

### Client
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **CSS3** - Styling with modern features

## Environment Variables

### Server
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Client URL for CORS (default: http://localhost:3000)

### Client
- `VITE_SERVER_URL` - Server URL (default: http://localhost:3001)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License