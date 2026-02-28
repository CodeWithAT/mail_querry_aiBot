import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import Atma from './Atma';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#010409', color: 'white', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', padding: '50px 30px', border: '1px solid #6b21a8', borderRadius: '15px', backgroundColor: '#0d1117', boxShadow: '0 0 30px rgba(107,33,168,0.3)', maxWidth: '600px', zIndex: 10 }}>
        
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#00f2fe', marginBottom: '20px', letterSpacing: '4px', textShadow: '0 0 15px rgba(0,242,254,0.5)' }}>
          ATMA CORE
        </h1>
        
        <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
          Welcome to the Neural Query Engine. Synthesize complex data streams and receive decrypted packets directly to your secure inbox.
        </p>
        
        <button 
          onClick={() => navigate('/engine')}
          style={{ padding: '15px 40px', backgroundColor: 'transparent', border: '2px solid #00f2fe', color: '#00f2fe', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '5px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 0 15px rgba(0,242,254,0.4)' }}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#00f2fe'; e.target.style.color = '#000'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#00f2fe'; }}
        >
          Initialize Engine
        </button>

      </div>
      
      <p style={{ position: 'absolute', bottom: '20px', color: '#4b5563', fontSize: '12px', letterSpacing: '3px' }}>
        SYSTEM V1.0 | SECURE CONNECTION
      </p>

    </div>
  );
};

function App() {
  return (
    // Only using <Routes> here, because <BrowserRouter> is already in your main.jsx
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/engine" element={<Home />} />
      <Route path="/atma" element={<Atma />} />
    </Routes>
  );
}

export default App;