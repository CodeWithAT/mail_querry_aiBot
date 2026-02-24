import React, { useState, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, Environment, Grid, Sparkles, Edges } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════
//  THE "DATA BRAIN" (Completely invisible until processing)
// ═══════════════════════════════════════════════════════════════════

function DataBrain({ isProcessing }) {
  const brainRef = useRef();
  
  useFrame(() => {
    if (!brainRef.current) return;
    
    // Smoothly scale to 1.3 when active, shrink to EXACTLY 0 when idle
    const targetScale = isProcessing ? 1.3 : 0;
    brainRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

    // Spin rapidly when processing
    if (isProcessing) {
      brainRef.current.rotation.y -= 0.04; 
      brainRef.current.rotation.x += 0.02;
    }
  });

  return (
    // Positioned strictly between/above the antennas
    <group ref={brainRef} position={[0, 1.4, 0]} scale={0}>
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
      
      {/* Intersecting Data Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.005, 16, 64]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={5} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[0.6, 0.005, 16, 64]} />
        <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={5} />
      </mesh>

      {/* Floating Data Nodes (Orbiting cubes) */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[Math.cos(i * 1.2) * 0.55, Math.sin(i * 2) * 0.2, Math.sin(i * 1.2) * 0.55]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} />
        </mesh>
      ))}

      <Sparkles count={40} scale={1.2} size={3} speed={3} color="#00f2fe" opacity={0.8} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  THE ANIMATED "LIQUID" GRID
// ═══════════════════════════════════════════════════════════════════

function AnimatedGrid() {
  const gridRef = useRef();

  useFrame((state) => {
    if (!gridRef.current) return;
    
    // 1. Infinite Forward Scrolling
    gridRef.current.position.z = (state.clock.elapsedTime * 1.5) % 1;
    
    // 2. Liquid Mouse Sway
    const targetTiltX = Math.sin(state.pointer.x * Math.PI) * 0.02;
    const targetTiltZ = state.pointer.x * 0.03;
    
    gridRef.current.rotation.x = THREE.MathUtils.lerp(gridRef.current.rotation.x, targetTiltX, 0.05);
    gridRef.current.rotation.z = THREE.MathUtils.lerp(gridRef.current.rotation.z, targetTiltZ, 0.05);
  });

  return (
    <group ref={gridRef}>
      <Grid 
        position={[0, -2, 0]} 
        args={[60, 60]} 
        cellColor="#00f2fe" 
        sectionColor="#a855f7" 
        fadeDistance={20} 
        cellThickness={1} 
        sectionThickness={1.5} 
      />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  THE UPGRADED ROBOT HEAD (Larger, High-Gloss, Tron Edges)
// ═══════════════════════════════════════════════════════════════════

function RobotHead({ isTyping, isProcessing }) {
  const headRef = useRef(null);
  const eyeColor = isProcessing ? "#a855f7" : "#00f2fe"; 
  
  useFrame((state) => {
    if (!headRef.current) return;
    
    let targetX = state.pointer.x * 0.4;
    let targetY = -state.pointer.y * 0.3;

    if (isTyping) {
      targetY = 0.3; 
      targetX = Math.sin(state.clock.elapsedTime * 4) * 0.05; 
    } else if (isProcessing) {
      targetY = -0.15; 
      targetX = 0;
    }

    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetY, 0.1);
  });

  return (
    <Float floatIntensity={0.2} speed={1.5} rotationIntensity={0.05}>
      <group ref={headRef} scale={1.4} position={[0, -0.2, 0]}>
        
        {/* Main Head - High Gloss & Tron Edges */}
        <mesh>
          <boxGeometry args={[1.4, 1.2, 1.2]} />
          <meshPhysicalMaterial color="#050810" roughness={0.1} metalness={0.9} clearcoat={1} />
          <Edges scale={1.001} color={eyeColor} opacity={0.3} transparent />
        </mesh>
        
        {/* Faceplate */}
        <mesh position={[0, -0.1, 0.61]}>
          <boxGeometry args={[1.2, 0.8, 0.1]} />
          <meshPhysicalMaterial color="#000000" roughness={0.1} metalness={1} />
        </mesh>

        {/* Glowing Eyes */}
        <group position={[0, 0.05, 0.67]}>
          <mesh position={[-0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.05]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isProcessing ? 6 : 4} />
          </mesh>
          <mesh position={[0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.05]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isProcessing ? 6 : 4} />
          </mesh>
        </group>

        {/* Antennas */}
        <group position={[0, 0.6, 0]}>
          <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.8]} />
            <meshStandardMaterial color="#555" metalness={1} />
          </mesh>
          <mesh position={[-0.48, 0.7, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isProcessing ? 5 : 2} />
          </mesh>

          <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.8]} />
            <meshStandardMaterial color="#555" metalness={1} />
          </mesh>
          <mesh position={[0.48, 0.7, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isProcessing ? 5 : 2} />
          </mesh>
        </group>

        {/* The Animated Holographic Brain */}
        <DataBrain isProcessing={isProcessing} />

      </group>
    </Float>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN HOME COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  const handleTyping = (e) => {
    setPrompt(e.target.value);
    setIsTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt || !email) return;
    setStatus('processing');
    try {
      const res = await fetch('https://atma-backend.onrender.com/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, email }),
      });
      if (res.ok) {
        setPrompt('');
        setStatus('done');
        setTimeout(() => setStatus('idle'), 3500);
      } else { setStatus('idle'); }
    } catch { setStatus('idle'); }
  };

  const isProcessing = status === 'processing';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #010409; }

        .galaxy-bg {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2070&auto=format&fit=crop');
          background-size: cover; background-position: center;
          opacity: 0.4; mix-blend-mode: screen;
        }

        .hud-label {
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.4em; color: #00f2fe; text-shadow: 0 0 10px rgba(0,242,254,0.5); text-transform: uppercase;
        }

        .input-cyan {
          width: 100%; padding: 20px 24px; border-radius: 8px;
          background: rgba(0, 15, 25, 0.6); 
          border: 1px solid #00f2fe;
          color: #fff; font-family: 'Orbitron', monospace; font-size: 1rem;
          outline: none; backdrop-filter: blur(10px); transition: all 0.3s;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.2), inset 0 0 15px rgba(0, 242, 254, 0.1);
        }
        .input-cyan:focus { border-color: #ffffff; box-shadow: 0 0 25px rgba(0, 242, 254, 0.5), inset 0 0 20px rgba(0, 242, 254, 0.3); }

        .input-purple {
          flex: 1; padding: 18px 24px; border-radius: 8px;
          background: rgba(15, 5, 25, 0.6); 
          border: 1px solid #a855f7;
          color: #fff; font-family: 'Share Tech Mono', monospace; font-size: 0.9rem;
          outline: none; backdrop-filter: blur(10px); transition: all 0.3s;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2), inset 0 0 15px rgba(168, 85, 247, 0.1);
        }
        .input-purple:focus { border-color: #ffffff; box-shadow: 0 0 25px rgba(168, 85, 247, 0.5); }

        .btn-purple {
          padding: 18px 40px; border-radius: 8px; 
          border: 1px solid #a855f7; background: rgba(168, 85, 247, 0.1);
          color: #e9d5ff; font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2), inset 0 0 10px rgba(168, 85, 247, 0.1);
        }
        .btn-purple.idle:hover { background: rgba(168, 85, 247, 0.4); border-color: #fff; color: #fff; box-shadow: 0 0 25px rgba(168, 85, 247, 0.6); }
        .btn-purple.processing { background: rgba(168, 85, 247, 0.6); color: #fff; box-shadow: 0 0 30px rgba(168,85,247,0.8); }

        .status-txt { font-family: 'Share Tech Mono', monospace; font-size: 0.65rem; color: #00f2fe; letter-spacing: 0.2em; text-transform: uppercase; }
      `}</style>

      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <div className="galaxy-bg" />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, transparent 40%, #010409 100%)', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%)', zIndex: 40, textAlign: 'center', pointerEvents: 'none' }}>
          <div className="hud-label" style={{ fontSize: '1.2rem' }}>NEURAL QUERY ENGINE</div>
        </div>

        {/* ─── 3D CANVAS ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <fog attach="fog" args={['#010409', 5, 15]} />
            
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 5, 8]} intensity={4} color="#ffffff" penumbra={1} />
            <pointLight position={[10, 10, 10]} intensity={4} color="#00f2fe" />
            
            <Environment preset="city" />
            
            {/* The Liquid Animated Grid */}
            <AnimatedGrid />
            
            <Suspense fallback={null}>
               <RobotHead isTyping={isTyping} isProcessing={isProcessing} />
            </Suspense>
            
            {/* Fixed the extra bracket in this position array! */}
            <ContactShadows position={[0, -1.8, 0]} opacity={0.8} scale={15} blur={2.5} far={4} color="#00f2fe" />
          </Canvas>
        </div>

        {/* ─── UI OVERLAY ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 750, padding: '0 30px', display: 'flex', flexDirection: 'column', gap: 16, pointerEvents: 'auto' }}>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                  className="input-cyan" 
                  type="text" 
                  placeholder="QUERY THE NEURAL CORE..." 
                  value={prompt} 
                  onChange={handleTyping} 
                  disabled={isProcessing} 
                />

                <div style={{ display: 'flex', gap: 12 }}>
                  <input 
                    className="input-purple" 
                    type="email" 
                    placeholder="DESTINATION EMAIL" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isProcessing} 
                  />
                  <button type="submit" className={`btn-purple ${isProcessing ? 'processing' : 'idle'}`} disabled={isProcessing}>
                      {isProcessing ? 'PROCESSING...' : 'EXECUTE'}
                  </button>
                </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginTop: '4px' }}>
              <span className="status-txt">
                {isProcessing ? '⬡ ATMA IS ANALYZING YOUR QUERY...' : status === 'done' ? '✓ TRANSMISSION COMPLETE' : '⬡ SYSTEM ONLINE'}
              </span>
              <Link to="/atma" target="_blank" className="status-txt" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                [ SYSTEM LOGS ]
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}