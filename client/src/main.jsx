import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1A1A1A',
          color: '#fff',
          border: '1px solid #2A2A2A',
          fontFamily: "'Space Grotesk', sans-serif"
        },
        success: { iconTheme: { primary: '#FF6600', secondary: '#0D0D0D' } }
      }}
    />
  </BrowserRouter>
)
