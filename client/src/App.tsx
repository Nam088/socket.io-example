import { LoginForm } from './components/LoginForm';
import { ChatRoom } from './components/ChatRoom';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const { 
    isConnected, 
    messages, 
    notifications,
    typingUsers, 
    user,
    loginError,
    subscribedRooms,
    currentRoom,
    roomError,
    login,
    adminLogin,
    adminBroadcast,
    logout,
    sendMessage, 
    startTyping, 
    stopTyping,
    joinRoom,
    leaveRoom,
    switchRoom
  } = useSocket();

  const handleLogin = (username: string) => {
    login({ username });
  };

  const handleAdminLogin = (username: string, password: string) => {
    adminLogin({ username, password });
  };

  if (!user) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onAdminLogin={handleAdminLogin}
        isConnected={isConnected} 
        loginError={loginError}
      />
    );
  }

  return (
    <ChatRoom
      user={user}
      messages={messages}
      notifications={notifications}
      typingUsers={typingUsers}
      subscribedRooms={subscribedRooms}
      currentRoom={currentRoom}
      roomError={roomError}
      onSendMessage={sendMessage}
      onAdminBroadcast={adminBroadcast}
      onStartTyping={startTyping}
      onStopTyping={stopTyping}
      onJoinRoom={joinRoom}
      onLeaveRoom={leaveRoom}
      onSwitchRoom={switchRoom}
      onLogout={logout}
    />
  );
}

export default App;