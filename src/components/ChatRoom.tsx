import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import UsersList from './UsersList'
import './ChatRoom.css'

interface ChatRoomProps {
  username: string
}

interface User {
  id: string
  username: string
}

interface Message {
  id: string
  text: string
  userId: string
  username: string
  timestamp: Date
}

function ChatRoom({ username }: ChatRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // ✅ Use environment variable instead of hardcoding
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    try {
      console.log('Connecting to backend at:', BACKEND_URL)

      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      fetch(BACKEND_URL)
        .then(res => {
          if (!res.ok) throw new Error(`Status: ${res.status}`)
          return res.text()
        })
        .then(() => {
          const newSocket = io(BACKEND_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            withCredentials: true
          })

          newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id)
            setError(null)
          })

          newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message)
            setError(`Connection error: ${err.message}`)
          })

          setSocket(newSocket)
          socketRef.current = newSocket

          return () => {
            newSocket.disconnect()
            socketRef.current = null
          }
        })
        .catch(err => {
          console.error('Server unreachable:', err.message)
          setError(`Cannot connect to ${BACKEND_URL}`)
        })

    } catch (err) {
      console.error('Error in connection:', err)
      setError(`Failed to connect to server.`)
    }
  }, [isReconnecting])

  useEffect(() => {
    if (!socket) return

    socket.emit('join', username)

    const handleWelcome = (data: { user: User; users: User[]; messages: Message[] }) => {
      setUsers(data.users)
      setMessages(data.messages)
      setConnected(true)
      setError(null)
    }

    const handleUserJoined = (data: { user: User; users: User[] }) => {
      setUsers(data.users)
    }

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message])
    }

    const handleUserLeft = (data: { userId: string; users: User[] }) => {
      setUsers(data.users)
    }

    const handleDisconnect = (reason: string) => {
      console.log('Disconnected:', reason)
      if (reason === 'io server disconnect') socket.connect()
    }

    socket.on('welcome', handleWelcome)
    socket.on('userJoined', handleUserJoined)
    socket.on('newMessage', handleNewMessage)
    socket.on('userLeft', handleUserLeft)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('welcome', handleWelcome)
      socket.off('userJoined', handleUserJoined)
      socket.off('newMessage', handleNewMessage)
      socket.off('userLeft', handleUserLeft)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket, username])

  const sendMessage = (text: string) => {
    if (socket && text.trim() !== '') {
      socket.emit('sendMessage', text)
    }
  }

  const handleRetry = () => setIsReconnecting(prev => !prev)

  if (error) {
    return (
      <div className="error-container">
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button onClick={handleRetry}>Try Again</button>
      </div>
    )
  }

  if (!connected) {
    return <div className="connecting">Connecting to chat server...</div>
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Users Online ({users.length})</h3>
        <UsersList users={users} />
      </div>
      <div className="chat-main">
        <div className="messages-container">
          <MessageList messages={messages} currentUserId={socket?.id || ''} />
        </div>
        <MessageInput sendMessage={sendMessage} />
      </div>
    </div>
  )
}

export default ChatRoom
