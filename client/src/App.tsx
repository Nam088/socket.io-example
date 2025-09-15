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
    login,
    adminLogin,
    adminBroadcast,
    logout,
    sendMessage, 
    startTyping, 
    stopTyping 
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
      onSendMessage={sendMessage}
      onAdminBroadcast={adminBroadcast}
      onStartTyping={startTyping}
      onStopTyping={stopTyping}
      onLogout={logout}
    />
  );
}

export default App;