import { useState, useEffect } from 'react'
import ChatRoom from './components/ChatRoom'
import LoginForm from './components/LoginForm'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

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
        <ChatRoom username={username} />
      )}
    </div>
  )
}

export default App 