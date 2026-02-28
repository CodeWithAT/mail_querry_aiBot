import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

// --- REUSABLE PIPELINE CONNECTOR COMPONENT ---
const PipelineConnector = ({ isProcessing, isTransferring, isDone, colorClass }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-12 lg:w-28 transform rotate-90 md:rotate-0 relative z-0">
      {/* Background Track */}
      <div className="absolute w-full h-[2px] bg-white/5 rounded-full"></div>
      
      {/* Glowing Progress Line */}
      <div className={`absolute left-0 h-[2px] ${colorClass} transition-all duration-700 ease-out ${isDone ? 'w-full shadow-[0_0_15px_currentColor]' : 'w-0'}`}></div>

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="absolute z-10 w-8 h-8 rounded-full border-4 border-white/5 border-t-current border-l-current animate-spin bg-[#050505] shadow-[0_0_20px_currentColor]" style={{ color: 'inherit' }}></div>
      )}

      {/* Data Transfer Particle */}
      {isTransferring && (
        <motion.div
          className={`absolute z-10 w-3 h-3 rounded-full bg-current shadow-[0_0_15px_currentColor]`}
          initial={{ left: '0%', x: '-50%' }}
          animate={{ left: '100%', x: '-50%' }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

// --- MAIN ATMA DASHBOARD ---
function Atma() {
  const [status, setStatus] = useState('idle'); 

  useEffect(() => {
    // Note: Change to your Render URL for production!
    const socket = io('https://mail-querry-aibot.onrender.com'); 
    socket.on('atma_status', (newStatus) => {
      setStatus(newStatus);
    });
    return () => socket.disconnect();
  }, []);

  const isAiDone = ['ai_transfer', 'email_processing', 'email_transfer', 'success'].includes(status);
  const isEmailDone = ['email_transfer', 'success'].includes(status);
  
  // Upgraded Box Styling with Glassmorphism
  const getBoxStyle = (isActive, isCompleted, colorTheme) => {
    const base = "w-[85%] md:w-64 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-500 z-10 relative overflow-hidden backdrop-blur-md border ";
    
    if (isActive) {
      return base + `${colorTheme.border} ${colorTheme.bg} scale-110 shadow-[0_0_40px_${colorTheme.shadow}] ring-1 ring-${colorTheme.ring}`;
    }
    if (isCompleted) {
      return base + `${colorTheme.borderDone} bg-white/10 opacity-100 shadow-[0_0_15px_${colorTheme.shadow}]`;
    }
    // Idle State (Frosted Dark Glass)
    return base + "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] opacity-60";
  };

  return (
    <div className="w-full min-h-screen bg-[#010308] text-slate-300 flex flex-col items-center justify-center p-2 md:p-8 relative overflow-hidden font-sans">
      
      {/* BACKGROUND EFFECTS */}
      {/* 1. Deep Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>
      
      {/* 2. Horizon Fading Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,242,254,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,242,254,0.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: 'perspective(800px) rotateX(60deg) translateY(-50px) translateZ(-150px)',
          animation: 'scrollGrid 12s linear infinite',
          maskImage: 'linear-gradient(to bottom, transparent 20%, black 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 20%, black 60%, black 100%)'
        }}
      >
        <style>{`
          @keyframes scrollGrid {
            0% { transform: perspective(800px) rotateX(60deg) translateY(0) translateZ(-150px); }
            100% { transform: perspective(800px) rotateX(60deg) translateY(50px) translateZ(-150px); }
          }
        `}</style>
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 w-full flex flex-col items-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white mb-4 tracking-[0.25em] drop-shadow-[0_0_20px_rgba(0,242,254,0.3)] text-center">
          ATMA TELEMETRY
        </h2>
        
        {/* Pro Telemetry Badge */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
          <span className="text-red-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-mono font-bold">
            Live Link Active
          </span>
        </div>
      </div>

      {/* NODES CONTAINER */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-0 px-4">
        
        {/* NODE 1: AI SYNTHESIS */}
        <div className={getBoxStyle(status === 'ai_processing', isAiDone, {
          border: 'border-cyan-400', bg: 'bg-cyan-500/10', shadow: 'rgba(34,211,238,0.4)', borderDone: 'border-cyan-800'
        })}>
          <div className={`text-4xl md:text-6xl mb-4 transition-all duration-500 ${status === 'ai_processing' ? 'drop-shadow-[0_0_20px_#22d3ee] scale-110 -translate-y-2' : 'grayscale opacity-70'}`}>🧠</div>
          <h3 className="font-bold tracking-[0.2em] text-[10px] md:text-sm text-white uppercase">AI Synthesis</h3>
          <p className="text-[9px] text-cyan-400 font-mono mt-2 opacity-70 uppercase tracking-widest">{status === 'ai_processing' ? 'Decrypting...' : (isAiDone ? 'Complete' : 'Standby')}</p>
        </div>

        <PipelineConnector 
          isProcessing={status === 'ai_processing'} 
          isTransferring={status === 'ai_transfer'} 
          isDone={isAiDone} 
          colorClass="bg-cyan-400"
        />

        {/* NODE 2: SMTP RELAY */}
        <div className={getBoxStyle(status === 'email_processing', isEmailDone, {
          border: 'border-purple-400', bg: 'bg-purple-500/10', shadow: 'rgba(192,132,252,0.4)', borderDone: 'border-purple-800'
        })}>
          <div className={`text-4xl md:text-6xl mb-4 transition-all duration-500 ${status === 'email_processing' ? 'drop-shadow-[0_0_20px_#c084fc] scale-110 -translate-y-2' : 'grayscale opacity-70'}`}>⚡</div>
          <h3 className="font-bold tracking-[0.2em] text-[10px] md:text-sm text-white uppercase">SMTP Relay</h3>
          <p className="text-[9px] text-purple-400 font-mono mt-2 opacity-70 uppercase tracking-widest">{status === 'email_processing' ? 'Bypassing...' : (isEmailDone ? 'Complete' : 'Standby')}</p>
        </div>

        <PipelineConnector 
          isProcessing={status === 'email_processing'} 
          isTransferring={status === 'email_transfer'} 
          isDone={status === 'success'} 
          colorClass="bg-purple-400"
        />

        {/* NODE 3: SUCCESS */}
        <div className={getBoxStyle(status === 'success', false, {
          border: 'border-emerald-400', bg: 'bg-emerald-500/10', shadow: 'rgba(52,211,153,0.6)'
        })}>
          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 1 }} 
              animate={{ scale: [0.8, 1.5, 2], opacity: [1, 0.5, 0] }} 
              transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity }}
              className="absolute inset-0 border-2 border-emerald-400 rounded-2xl pointer-events-none"
            />
          )}
          <div className={`text-4xl md:text-6xl mb-4 transition-all duration-700 ${status === 'success' ? 'drop-shadow-[0_0_25px_#34d399] scale-125 -translate-y-2' : 'grayscale opacity-70'}`}>✅</div>
          <h3 className="font-bold tracking-[0.2em] text-[10px] md:text-sm text-white uppercase">Transmission</h3>
          <p className="text-[9px] text-emerald-400 font-mono mt-2 opacity-70 uppercase tracking-widest">{status === 'success' ? 'Delivered' : 'Awaiting Data'}</p>
        </div>

      </div>
    </div>
  );
}

export default Atma;