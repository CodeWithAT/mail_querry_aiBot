import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

// --- REUSABLE PIPELINE CONNECTOR COMPONENT ---
const PipelineConnector = ({ isProcessing, isTransferring, isDone, colorClass }) => {
  return (
    <div className="flex items-center justify-center w-16 h-12 md:w-24 md:h-12 lg:w-32 transform rotate-90 md:rotate-0 relative z-0">
      <div className="absolute w-full h-[2px] bg-slate-800 rounded-full"></div>
      <div className={`absolute left-0 h-[2px] ${colorClass} transition-all duration-500 ease-out ${isDone ? 'w-full shadow-[0_0_10px_currentColor]' : 'w-0'}`}></div>

      {isProcessing && (
        <div className="absolute z-10 w-8 h-8 rounded-full border-4 border-slate-800 border-t-current border-l-current animate-spin bg-[#050505]" style={{ color: 'inherit' }}></div>
      )}

      {isTransferring && (
        <motion.div
          className={`absolute z-10 text-xl drop-shadow-[0_0_8px_currentColor]`}
          initial={{ left: '0%', x: '-50%' }}
          animate={{ left: '100%', x: '-50%' }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          ➔
        </motion.div>
      )}
    </div>
  );
};

// --- MAIN ATMA DASHBOARD ---
function Atma() {
  const [status, setStatus] = useState('idle'); 

  useEffect(() => {
    const socket = io('https://mail-querry-aibot.onrender.com');
    socket.on('atma_status', (newStatus) => {
      setStatus(newStatus);
    });
    return () => socket.disconnect();
  }, []);

  const isAiDone = ['ai_transfer', 'email_processing', 'email_transfer', 'success'].includes(status);
  const isEmailDone = ['email_transfer', 'success'].includes(status);
  
  const getBoxStyle = (isActive, isCompleted, colorTheme) => {
    const base = "w-[80%] md:w-64 p-4 md:p-6 rounded-2xl border-2 backdrop-blur-xl flex flex-col items-center justify-center text-center transition-all duration-500 z-10 relative overflow-hidden ";
    if (isActive) return base + `${colorTheme.border} ${colorTheme.bg} scale-105 shadow-[0_0_30px_${colorTheme.shadow}]`;
    if (isCompleted) return base + `${colorTheme.borderDone} bg-black/50 opacity-80`;
    return base + "border-slate-800 bg-black/40 opacity-40 grayscale";
  };

  return (
    <div className="w-full h-full bg-[#050505] text-slate-300 flex flex-col items-center justify-center p-2 md:p-8 relative overflow-hidden font-sans">
      
      {/* GLOWING GRID BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(600px) rotateX(60deg) translateY(-50px) translateZ(-100px)',
          animation: 'scrollGrid 10s linear infinite'
        }}
      >
        <style>{`
          @keyframes scrollGrid {
            0% { transform: perspective(600px) rotateX(60deg) translateY(0) translateZ(-100px); }
            100% { transform: perspective(600px) rotateX(60deg) translateY(40px) translateZ(-100px); }
          }
        `}</style>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center mb-6 md:mb-12">
        <h2 className="text-xl md:text-3xl font-extrabold text-white mb-2 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-center">
          CORE "ATMA" VISUALIZER
        </h2>
        <p className="text-cyan-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></span>
          Live Telemetry
        </p>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full gap-2 md:gap-0 px-2">
        
        {/* NODE 1: AI SYNTHESIS */}
        <div className={getBoxStyle(status === 'ai_processing', isAiDone, {
          border: 'border-cyan-400', bg: 'bg-cyan-900/20', shadow: 'rgba(34,211,238,0.3)', borderDone: 'border-cyan-800'
        })}>
          <span className={`text-3xl md:text-5xl mb-2 md:mb-4 transition-all ${status === 'ai_processing' ? 'drop-shadow-[0_0_15px_#22d3ee] scale-110' : ''}`}>🧠</span>
          <h3 className="font-bold tracking-widest text-[10px] md:text-sm text-white uppercase">AI SYNTHESIS</h3>
        </div>

        <PipelineConnector 
          isProcessing={status === 'ai_processing'} 
          isTransferring={status === 'ai_transfer'} 
          isDone={isAiDone} 
          colorClass="bg-cyan-400"
        />

        {/* NODE 2: SMTP RELAY */}
        <div className={getBoxStyle(status === 'email_processing', isEmailDone, {
          border: 'border-purple-400', bg: 'bg-purple-900/20', shadow: 'rgba(192,132,252,0.3)', borderDone: 'border-purple-800'
        })}>
          <span className={`text-3xl md:text-5xl mb-2 md:mb-4 transition-all ${status === 'email_processing' ? 'drop-shadow-[0_0_15px_#c084fc] scale-110' : ''}`}>⚡</span>
          <h3 className="font-bold tracking-widest text-[10px] md:text-sm text-white uppercase">SMTP RELAY</h3>
        </div>

        <PipelineConnector 
          isProcessing={status === 'email_processing'} 
          isTransferring={status === 'email_transfer'} 
          isDone={status === 'success'} 
          colorClass="bg-purple-400"
        />

        {/* NODE 3: SUCCESS */}
        <div className={getBoxStyle(status === 'success', false, {
          border: 'border-emerald-400', bg: 'bg-emerald-900/20', shadow: 'rgba(52,211,153,0.5)', borderDone: ''
        })}>
          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0, opacity: 1 }} 
              animate={{ scale: [0, 2, 3], opacity: [1, 0.5, 0] }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 border-4 border-emerald-400 rounded-2xl pointer-events-none"
            />
          )}
          <span className={`text-3xl md:text-5xl mb-2 md:mb-4 transition-all duration-700 ${status === 'success' ? 'drop-shadow-[0_0_20px_#34d399] scale-125' : ''}`}>✅</span>
          <h3 className="font-bold tracking-widest text-[10px] md:text-sm text-white uppercase">TRANSMISSION</h3>
        </div>

      </div>
    </div>
  );
}

export default Atma;