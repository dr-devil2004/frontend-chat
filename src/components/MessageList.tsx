import { useEffect, useRef } from 'react'
import './MessageList.css'

interface Message {
  id: string
  text: string
  userId: string
  username: string
  timestamp: Date
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start the conversation!</div>
      ) : (
        messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.userId === currentUserId ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <span className="message-username">
                {message.userId === currentUserId ? 'You' : message.username}
              </span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList 