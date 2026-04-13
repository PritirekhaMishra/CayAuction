import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuctionProvider } from './context/AuctionContext'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">

      {/* ✅ Router MUST BE ABOVE */}
      <BrowserRouter>

        <AuthProvider>
          <AuctionProvider>
            <App />
          </AuctionProvider>
        </AuthProvider>

      </BrowserRouter>

    </GoogleOAuthProvider>
  </React.StrictMode>,
)