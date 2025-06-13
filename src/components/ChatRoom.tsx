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

// Get backend URL from environment or use default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-chat-kx0c.onrender.com';

function ChatRoom({ username }: ChatRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  
  // Initialize socket connection
  useEffect(() => {
    try {
      console.log('Connecting to backend at:', BACKEND_URL)
      
      // Clean up previous socket if it exists
      if (socketRef.current) {
        console.log('Cleaning up previous socket connection')
        socketRef.current.disconnect()
      }
      
      // First check if the server is reachable
      fetch(BACKEND_URL, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`)
          }
          return response.text()
        })
        .then(data => {
          console.log('Backend server is reachable:', data)
          
          // Now connect with socket.io
          const newSocket = io(BACKEND_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            withCredentials: true,
            transports: ['websocket', 'polling'],
            forceNew: true,
            autoConnect: true,
            path: '/socket.io/',
            upgrade: true,
            rememberUpgrade: true,
            rejectUnauthorized: false,
            extraHeaders: {
              'Access-Control-Allow-Origin': '*'
            },
            query: {
              username: username
            }
          })
          
          newSocket.on('connect', () => {
            console.log('Socket connected successfully with ID:', newSocket.id)
            setError(null)
            setConnected(true)
          })
          
          newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message)
            setError(`Connection error: ${err.message}. Please make sure the backend server is running.`)
            setConnected(false)
          })
          
          newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            setConnected(false)
            if (reason === 'io server disconnect') {
              // the disconnection was initiated by the server, reconnect manually
              newSocket.connect()
            }
          })
          
          setSocket(newSocket)
          socketRef.current = newSocket
          
          return () => {
            console.log('Cleanup: disconnecting socket')
            newSocket.disconnect()
            socketRef.current = null
          }
        })
        .catch(err => {
          console.error('Server check failed:', err.message)
          setError(`Cannot connect to server at ${BACKEND_URL}. Please make sure the backend server is running.`)
          setConnected(false)
        })
    } catch (err) {
      console.error('Socket initialization error:', err)
      setError(`Failed to connect to chat server. Please try again later.`)
      setConnected(false)
    }
  }, [isReconnecting, username])
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return
    
    // Join chat room
    socket.emit('join', username)
    
    // Handle welcome event (when user joins)
    const handleWelcome = (data: { user: User; users: User[]; messages: Message[] }) => {
      console.log('Welcome event received:', data)
      setUsers(data.users)
      setMessages(data.messages)
      setConnected(true)
      setError(null)
    }
    
    // Handle user joined event
    const handleUserJoined = (data: { user: User; users: User[] }) => {
      console.log('User joined event received:', data)
      setUsers(data.users)
    }
    
    // Handle new message event
    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message)
      setMessages(prev => [...prev, message])
    }
    
    // Handle user left event
    const handleUserLeft = (data: { userId: string; users: User[] }) => {
      console.log('User left event received:', data)
      setUsers(data.users)
    }
    
    socket.on('welcome', handleWelcome)
    socket.on('userJoined', handleUserJoined)
    socket.on('newMessage', handleNewMessage)
    socket.on('userLeft', handleUserLeft)
    
    // Clean up event listeners
    return () => {
      socket.off('welcome', handleWelcome)
      socket.off('userJoined', handleUserJoined)
      socket.off('newMessage', handleNewMessage)
      socket.off('userLeft', handleUserLeft)
      socket.off('connect_error')
    }
  }, [socket, username])
  
  const sendMessage = (text: string) => {
    if (socket && text.trim() !== '') {
      socket.emit('sendMessage', text)
    }
  }
  
  const handleRetry = () => {
    setIsReconnecting(prev => !prev)
  }
  
  if (error) {
    return <div className="error-container">
      <h3>Connection Error</h3>
      <p>{error}</p>
      <button onClick={handleRetry}>Try Again</button>
    </div>
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
