
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { io } from 'socket.io-client'


const socket = io(import.meta.env.VITE_API_URL)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
)
