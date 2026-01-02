
import React, { useState, useEffect, useRef } from 'react';

interface BreathingGameProps {
  onSuccess: () => void;
}

const BreathingGame: React.FC<BreathingGameProps> = ({ onSuccess }) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [scale, setScale] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [message, setMessage] = useState("长按：吸气");
  const [shake, setShake] = useState(0);
  
  const progressRef = useRef(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      const now = Date.now();
      const cycle = 4000;
      const t = (now % cycle) / cycle;
      
      const newPhase = t < 0.5 ? 'inhale' : 'exhale';
      const phaseT = t < 0.5 ? t * 2 : (t - 0.5) * 2;
      
      setPhase(newPhase);
      setScale(newPhase === 'inhale' ? 1 + phaseT : 2 - phaseT);

      // Logical check for progression
      const isCorrect = (isPressing && newPhase === 'inhale') || (!isPressing && newPhase === 'exhale');
      
      if (isCorrect) {
        progressRef.current = Math.min(progressRef.current + 0.35, 100);
      } else {
        progressRef.current = Math.max(progressRef.current - 0.2, 0);
      }
      
      setProgress(progressRef.current);
      setShake(isCorrect ? progressRef.current * 0.05 : 0);
      setMessage(newPhase === 'inhale' ? "同频：敛神" : "同频：化尘");

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPressing]);

  useEffect(() => {
    if (progress >= 100) {
      onSuccess();
    }
  }, [progress, onSuccess]);

  return (
    <div className={`absolute inset-0 z-[200] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-[2000ms]`}>
      <div 
        className="relative flex items-center justify-center"
        style={{ transform: `translate(${(Math.random()-0.5)*shake}px, ${(Math.random()-0.5)*shake}px)` }}
      >
        {/* Core Breathing Light */}
        <div 
          className="absolute rounded-full transition-all duration-150 ease-out blur-[2px]"
          style={{ 
            width: '80px', 
            height: '80px', 
            transform: `scale(${scale})`,
            backgroundColor: isPressing ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
            boxShadow: `0 0 ${20 + progress * 0.5}px white`
          }}
        />
        
        {/* Ring */}
        <div 
           className={`absolute rounded-full border transition-all duration-500 ${isPressing ? 'border-white/60' : 'border-white/20'}`}
           style={{ 
             width: '120px', 
             height: '120px',
             transform: `scale(${isPressing ? 1.05 : 1})`
           }}
        />

        {/* Radial Progress */}
        <svg className="absolute w-80 h-80 -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="white"
            strokeWidth="1"
            className="opacity-10"
          />
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
            style={{ filter: 'drop-shadow(0 0 8px white)' }}
            className="transition-all duration-300"
          />
        </svg>

        <div className="z-10 text-white font-serif tracking-[0.5em] text-xs">
          {Math.floor(progress)}%
        </div>
      </div>

      <div className="mt-24 text-white/50 tracking-[0.8em] text-[10px] font-serif uppercase animate-pulse">
        {message}
      </div>

      <div className="absolute bottom-16 text-white/20 text-[9px] tracking-[0.2em] font-serif italic">
        ( 保持神识与宿命的同频，直至化尘 )
      </div>

      <div 
        className="absolute inset-0 cursor-pointer"
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
      />
    </div>
  );
};

export default BreathingGame;
