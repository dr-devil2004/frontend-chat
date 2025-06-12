import { useState } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatRoom from './components/ChatRoom'
import LoginForm from './components/LoginForm'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL)
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const handleLogin = (username: string) => {
    setUsername(username)
    setIsLoggedIn(true)
  }

  return (
    <div className="app-container">
      <h1>Real-time Chat App</h1>
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        socket && <ChatRoom username={username} />
      )}
    </div>
  )
}

export default App
