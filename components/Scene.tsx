
import React, { useMemo, useEffect, useState } from 'react';
import { GameState, Point, InteractionPoint, Petal } from '../types';

interface SceneProps {
  gameState: GameState;
  sparkPos: Point;
  onInteract: (point: InteractionPoint) => void;
  interactionPoints: InteractionPoint[];
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const Scene: React.FC<SceneProps> = ({ gameState, sparkPos, onInteract, interactionPoints }) => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [purifySparkles, setPurifySparkles] = useState<Sparkle[]>([]);

  // Parallax with deep layers
  const parallax = useMemo(() => ({
    sky: { x: (sparkPos.x - 50) * 0.02, y: (sparkPos.y - 50) * 0.02 },
    far: { x: (sparkPos.x - 50) * 0.08, y: (sparkPos.y - 50) * 0.08 },
    mid: { x: (sparkPos.x - 50) * 0.15, y: (sparkPos.y - 50) * 0.15 },
    near: { x: (sparkPos.x - 50) * 0.45, y: (sparkPos.y - 50) * 0.45 },
  }), [sparkPos]);

  useEffect(() => {
    const initialPetals = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.1 + Math.random() * 0.3,
      amplitude: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 1.5 - 0.75,
      size: 2 + Math.random() * 4
    }));
    setPetals(initialPetals);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPetals(prev => prev.map(p => ({
        ...p,
        y: p.y + p.speed > 105 ? -5 : p.y + p.speed,
        x: p.x + Math.sin(Date.now() / 2000 + p.phase) * 0.03,
        rotation: p.rotation + p.rotationSpeed
      })));

      if (gameState === GameState.PURIFIED) {
        setPurifySparkles(prev => {
          const next = prev.map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            life: s.life - 0.01
          })).filter(s => s.life > 0);
          
          if (next.length < 30) {
            next.push({
              id: Math.random(),
              x: 65 + (Math.random() - 0.5) * 5,
              y: 65 + (Math.random() - 0.5) * 5,
              vx: (Math.random() - 0.5) * 0.2,
              vy: -0.2 - Math.random() * 0.3,
              life: 1
            });
          }
          return next;
        });
      }
    }, 16);
    return () => clearInterval(interval);
  }, [gameState]);

  const isPurified = gameState === GameState.PURIFIED;

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-[4000ms] ${isPurified ? 'bg-[#2a2222]' : 'bg-[#0a0c10]'}`}>
      
      {/* Volumetric God Rays (Sky Layer) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 transition-transform duration-[1000ms] ease-out"
        style={{ transform: `translate(${-parallax.sky.x}px, ${-parallax.sky.y}px) rotate(-15deg)` }}
      >
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] flex gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-full w-20 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl transform skew-x-12" />
          ))}
        </div>
      </div>

      {/* FAR LAYER - Silent architecture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ transform: `translate(${-parallax.far.x}px, ${-parallax.far.y}px)` }}
      >
        <div className="absolute bottom-[20%] left-[10%] w-[1px] h-[50%] bg-white/10" />
        <div className="absolute bottom-[20%] right-[20%] w-[200px] h-[300px] border-l border-t border-white/5" />
      </div>

      {/* MID LAYER - The Garden */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${-parallax.mid.x}px, ${-parallax.mid.y}px)` }}
      >
        {/* Ground with texture */}
        <div className={`absolute bottom-0 w-full h-[35%] transition-colors duration-[4000ms] ${isPurified ? 'bg-[#352b2b]' : 'bg-[#121418]'}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* The Tree */}
        <div className="absolute left-[12%] bottom-0 w-16 h-[85%]">
          <div className={`w-full h-full transition-colors duration-[4000ms] ${isPurified ? 'bg-[#42342c]' : 'bg-[#0d0f13]'}`} />
          <div className={`absolute -top-40 -left-60 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-[4000ms] ${isPurified ? 'bg-pink-600/10' : 'bg-blue-900/5'}`} />
        </div>

        {/* Character: Daiyu */}
        <div className={`absolute left-[65%] bottom-[16%] w-14 h-40 flex flex-col items-center transition-all duration-[4000ms] ${isPurified ? 'scale-105' : 'scale-100'}`}>
          {/* Pixel Head */}
          <div className="relative w-9 h-10 mb-1 z-10">
            <div className={`w-full h-full rounded-sm transition-colors duration-[4000ms] ${isPurified ? 'bg-[#d2aba0]' : 'bg-[#8d7d78]'}`} />
            <div className="absolute -top-1 -left-1 w-11 h-7 bg-[#0c0c0c] rounded-t-md" />
            <div className={`absolute -right-2 top-3 w-1.5 h-7 transition-colors duration-[4000ms] ${isPurified ? 'bg-pink-400' : 'bg-blue-400/20'}`} />
          </div>

          {/* Pixel Body */}
          <div className={`w-16 flex-1 relative transition-all duration-[4000ms] rounded-b-xl ${isPurified ? 'bg-[#fdf3f5]' : 'bg-[#b8b8b8]'}`}>
             <div className={`absolute top-5 w-full h-1 transition-colors duration-[4000ms] ${isPurified ? 'bg-pink-200' : 'bg-gray-500/50'}`} />
             {/* Character shadow on ground */}
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/30 rounded-full blur-sm" />
          </div>

          {/* Emotional Aura */}
          {gameState === GameState.EXPLORING && (
            <div className="absolute inset-[-80px] border border-blue-400/5 rounded-full animate-pulse blur-3xl" />
          )}

          {/* Niagara-style Purification Particles */}
          {purifySparkles.map(s => (
            <div 
              key={s.id}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${(s.x - 65) * 10}px`,
                top: `${(s.y - 65) * 10}px`,
                opacity: s.life,
                transform: `scale(${s.life * 2})`,
                boxShadow: '0 0 10px white'
              }}
            />
          ))}
        </div>

        {/* Items */}
        {interactionPoints.map(p => (
          <button
            key={p.id}
            onClick={() => onInteract(p)}
            className={`absolute z-40 group transition-all duration-[2000ms] ${isPurified ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white group-hover:scale-125 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
               <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 border border-white/10 text-[10px] tracking-[0.4em] text-white/80 whitespace-nowrap shadow-xl">
                 {p.label}
               </div>
            </div>
          </button>
        ))}
      </div>

      {/* Near Layer - Foreground Shadows */}
      <div 
        className="absolute inset-0 pointer-events-none z-[80] transition-transform duration-[1500ms] ease-out"
        style={{ transform: `translate(${-parallax.near.x}px, ${-parallax.near.y}px) scale(1.15)` }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-black/40 blur-[100px] rotate-[35deg]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/30 blur-[120px]" />
      </div>

      {/* Post-Process Overlays */}
      <div className="absolute inset-0 pointer-events-none z-[100] vignette" />
      <div className="absolute inset-0 pointer-events-none z-[101] scanlines" />
      
      {/* Bloom Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[102] bloom-layer opacity-20" />

      {/* Falling Petals Particle System */}
      <div className="absolute inset-0 pointer-events-none z-[50]">
        {petals.map(p => (
          <div 
            key={p.id}
            className="absolute transition-colors duration-[4000ms]"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              width: `${p.size}px`, 
              height: `${p.size * 0.7}px`,
              backgroundColor: isPurified ? '#ffd1dc' : '#d4d4d4',
              opacity: isPurified ? 0.7 : 0.4,
              transform: `rotate(${p.rotation}deg)`,
              borderRadius: '80% 20% 80% 20% / 50%',
              boxShadow: isPurified ? '0 0 5px rgba(255,192,203,0.2)' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Scene;
