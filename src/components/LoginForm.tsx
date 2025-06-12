import { useState } from 'react'
import './LoginForm.css'

interface LoginFormProps {
  onLogin: (username: string) => void
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    
    onLogin(username)
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Join Chat</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
            />
          </div>
          <button type="submit" className="login-button">
            Join
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm 