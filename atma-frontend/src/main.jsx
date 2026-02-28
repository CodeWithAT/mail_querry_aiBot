import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // 👈 IMPORT THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* 👈 WRAP YOUR APP IN THIS */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)