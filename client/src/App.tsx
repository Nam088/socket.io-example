import { useState } from 'react';
import { JoinForm } from './components/JoinForm';
import { ChatRoom } from './components/ChatRoom';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<{ username: string; room: string } | null>(null);
  const { 
    isConnected, 
    messages, 
    typingUsers, 
    joinRoom, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useSocket();

  const handleJoin = (username: string, room: string) => {
    setCurrentUser({ username, room });
    joinRoom({ username, room });
  };

  const handleLeave = () => {
    setCurrentUser(null);
    // In a real app, you might want to emit a 'leave' event to the server
  };

  if (!currentUser) {
    return <JoinForm onJoin={handleJoin} isConnected={isConnected} />;
  }

  return (
    <ChatRoom
      username={currentUser.username}
      room={currentUser.room}
      messages={messages}
      typingUsers={typingUsers}
      onSendMessage={sendMessage}
      onStartTyping={startTyping}
      onStopTyping={stopTyping}
      onLeave={handleLeave}
    />
  );
}

export default App;