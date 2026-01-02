
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Point, InteractionPoint, CollectionItem } from './types';
import Scene from './components/Scene';
import BreathingGame from './components/BreathingGame';
import DialogueBox from './components/DialogueBox';
import { generateZenReflection } from './services/gemini';

const INTERACTION_POINTS: InteractionPoint[] = [
  { id: 'hoe', x: 28, y: 72, label: '探看：落花锄', text: '质本洁来还洁去，强于污淖陷渠沟。' },
  { id: 'pouch', x: 52, y: 78, label: '探看：锦囊袋', text: '一抔净土掩风流，莫向春风怨离情。' },
  { id: 'daiyu', x: 65, y: 65, label: '共鸣：离人之泪', text: '试看春残花渐落，便是红颜老死时。一朝春尽红颜老，花落人亡两不知。', isCore: true },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [sparkPos, setSparkPos] = useState<Point>({ x: 90, y: 50 });
  const [targetSparkPos, setTargetSparkPos] = useState<Point>({ x: 90, y: 50 });
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [zenReflection, setZenReflection] = useState<string>("");
  const [isPurifying, setIsPurifying] = useState(false);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [showCollection, setShowCollection] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    const moveSpark = () => {
      setSparkPos(prev => ({
        x: prev.x + (targetSparkPos.x - prev.x) * 0.06,
        y: prev.y + (targetSparkPos.y - prev.y) * 0.06,
      }));
      animationFrame = requestAnimationFrame(moveSpark);
    };
    animationFrame = requestAnimationFrame(moveSpark);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetSparkPos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState === GameState.RESONANCE || showCollection) return;
    setTargetSparkPos({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  };

  const handleOpenKeyDialog = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const handleInteraction = useCallback((point: InteractionPoint) => {
    if (point.isCore) {
      setGameState(GameState.RESONANCE);
      setDialogue(null);
    } else {
      setDialogue(point.text);
      setTimeout(() => setDialogue(null), 5000);
    }
  }, []);

  const onResonanceSuccess = async () => {
    setIsPurifying(true);
    try {
      const reflection = await generateZenReflection("黛玉葬花，生命如落红般无常而洁净");
      setZenReflection(reflection);
      
      const newItem: CollectionItem = {
        id: `mote_${Date.now()}`,
        title: '黛玉葬花 · 尘缘',
        reflection: reflection,
        timestamp: Date.now()
      };
      setCollection(prev => [newItem, ...prev]);
    } catch (err) {
      setZenReflection("凡所有相，皆是虚妄。");
    } finally {
      setTimeout(() => {
        setGameState(GameState.PURIFIED);
        setIsPurifying(false);
      }, 1500);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen bg-black overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Scene */}
      <Scene 
        gameState={gameState} 
        sparkPos={sparkPos} 
        onInteract={handleInteraction}
        interactionPoints={INTERACTION_POINTS}
      />

      {/* Divine Spark Cursor */}
      <div 
        className="absolute pointer-events-none transition-all duration-300 z-[150]"
        style={{ 
          left: `${sparkPos.x}%`, 
          top: `${sparkPos.y}%`, 
          transform: 'translate(-50%, -50%)',
          opacity: (showCollection || gameState === GameState.RESONANCE) ? 0 : 1
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white blur-[2px] opacity-80 shadow-[0_0_20px_white]" />
        <div className="absolute inset-[-8px] w-8 h-8 rounded-full border border-white/20 animate-ping" />
      </div>

      {/* Game Intro */}
      {gameState === GameState.INTRO && (
        <div className="absolute inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center text-white p-10 text-center transition-opacity duration-1000">
          <div className="mb-4 text-white/30 tracking-[1.5em] text-[10px] uppercase">A Dream of Red Mansions</div>
          <h1 className="text-6xl mb-16 font-serif tracking-[0.8em] font-light text-gray-100">石头记：微尘</h1>
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent mb-16" />
          <p className="text-lg text-gray-400 mb-16 max-w-lg leading-loose font-serif font-light">
            扮演一缕游离的神识，<br/>
            在注定的悲剧中捕捉那一瞬的微尘。<br/>
            见证、共振、然后离去。
          </p>
          <div className="flex gap-6">
            <button 
              onClick={() => setGameState(GameState.EXPLORING)}
              className="group relative border border-white/20 px-16 py-5 overflow-hidden transition-all duration-700 hover:border-white/60"
            >
              <span className="relative z-10 tracking-[0.8em] text-xs font-serif group-hover:text-white transition-colors">入 梦</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-5" />
            </button>
            <button 
              onClick={handleOpenKeyDialog}
              className="text-[9px] tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity border border-white/10 px-6 py-5 uppercase font-serif"
            >
              注入灵力
            </button>
          </div>
        </div>
      )}

      {/* Narrative Dialogue */}
      <DialogueBox text={dialogue} visible={!!dialogue} />

      {/* Top Navigation */}
      {gameState === GameState.EXPLORING && !showCollection && (
        <div className="absolute top-10 right-10 z-[120] flex gap-6 items-center">
          <button 
            onClick={handleOpenKeyDialog}
            className="group opacity-20 hover:opacity-100 transition-opacity flex items-center gap-3"
          >
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center rotate-45 group-hover:border-white/50 transition-all">
              <div className="w-1 h-1 bg-white rotate-[-45deg]" />
            </div>
            <span className="text-[9px] tracking-[0.4em] text-white/40 uppercase font-serif">Energy</span>
          </button>
          <button 
            onClick={() => setShowCollection(true)}
            className="group flex flex-col items-center"
          >
            <div className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-all relative">
              <div className="w-5 h-5 bg-white/30 group-hover:bg-white/80 transition-all rotate-45" />
              <div className="absolute inset-0 border border-white/5 scale-125" />
            </div>
            <span className="mt-3 text-[9px] tracking-[0.5em] text-white/30 group-hover:text-white/80 uppercase font-serif">Record</span>
          </button>
        </div>
      )}

      {/* Collection UI (Taixu Illusion) */}
      {showCollection && (
        <div className="absolute inset-0 z-[400] bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center p-20 animate-fade-in">
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
             {/* Traditional Pattern Backdrop */}
             <div className="grid grid-cols-8 gap-4 rotate-12 scale-150">
               {Array.from({length: 64}).map((_, i) => (
                 <div key={i} className="w-40 h-40 border border-white/20 rounded-sm" />
               ))}
             </div>
          </div>
          
          <h2 className="text-3xl text-white/90 font-serif tracking-[1.2em] mb-20 font-light">太虚幻境 · 尘缘集</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full max-h-[55vh] overflow-y-auto pr-8 custom-scrollbar">
            {collection.length === 0 ? (
              <div className="col-span-2 text-center text-white/20 font-serif py-32 border border-white/5 bg-white/[0.02]">
                尚无尘缘入梦...
              </div>
            ) : (
              collection.map(item => (
                <div key={item.id} className="p-10 border border-white/5 hover:border-white/20 transition-all bg-white/[0.03] group relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20" />
                  <div className="text-[10px] text-white/20 mb-4 tracking-[0.4em] uppercase font-serif">[{item.title}]</div>
                  <p className="text-white/70 font-serif text-xl leading-relaxed mb-8 group-hover:text-white transition-colors">
                    {item.reflection}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-serif">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                    <div className="w-8 h-px bg-white/10" />
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setShowCollection(false)}
            className="mt-20 text-white/40 hover:text-white tracking-[0.6em] text-[10px] border-b border-transparent hover:border-white/40 transition-all font-serif"
          >
            [ 返回梦境 ]
          </button>
        </div>
      )}

      {/* Resonance Gameplay */}
      {gameState === GameState.RESONANCE && (
        <BreathingGame onSuccess={onResonanceSuccess} />
      )}

      {/* Purification Reflection Screen */}
      {gameState === GameState.PURIFIED && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-sm animate-fade-in">
          <div className="max-w-3xl text-center px-16">
            <div className="w-px h-24 bg-gradient-to-b from-transparent to-white/20 mx-auto mb-16" />
            <p className="text-3xl text-white font-serif mb-16 tracking-widest leading-[2.5] font-light">
              {zenReflection}
            </p>
            <div className="w-px h-24 bg-gradient-to-t from-transparent to-white/20 mx-auto mb-20" />
            <button 
               onClick={() => setGameState(GameState.ENDING)}
               className="group text-white/40 hover:text-white transition-all flex flex-col items-center"
            >
              <span className="tracking-[1em] text-xs mb-4 font-serif uppercase">微尘归位</span>
              <div className="w-12 h-px bg-white/20 group-hover:w-32 transition-all duration-700" />
            </button>
          </div>
        </div>
      )}

      {/* Final Ending Screen */}
      {gameState === GameState.ENDING && (
        <div className="absolute inset-0 bg-black z-[1000] flex flex-col items-center justify-center text-white p-10 animate-fade-in">
           <div className="text-white/10 text-[9px] tracking-[1.5em] mb-8 uppercase">Project Mote - Ending</div>
           <h2 className="text-4xl mb-16 font-serif tracking-[0.6em] font-light text-gray-200">以此片刻，祭奠红楼。</h2>
           <p className="text-gray-500 mb-20 max-w-md text-center leading-loose font-serif italic text-base font-light opacity-60">
             “好便了，了便好。若不了，便不好；若要好，须是了。”
           </p>
           <button 
            onClick={() => window.location.reload()} 
            className="text-[10px] border border-white/10 px-12 py-5 opacity-40 hover:opacity-100 hover:border-white/40 transition-all tracking-[0.5em] font-serif"
           >
            重 拾 残 梦
           </button>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in {
          animation: fade-in 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;
