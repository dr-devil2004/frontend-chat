import { useState } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  sendMessage: (text: string) => void
}

function MessageInput({ sendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim()) {
      sendMessage(message)
      setMessage('')
    }
  }
  
  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  )
}

export default MessageInput 