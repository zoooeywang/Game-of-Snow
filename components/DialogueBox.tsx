
import React from 'react';

interface DialogueBoxProps {
  text: string | null;
  visible: boolean;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ text, visible }) => {
  return (
    <div 
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-[70] transition-all duration-500 max-w-lg w-full px-6
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-sm shadow-2xl">
        <p className="text-white font-serif tracking-[0.2em] leading-relaxed text-center">
          {text}
        </p>
      </div>
      <div className="mt-4 flex justify-center">
         <div className="w-1 h-1 rounded-full bg-white/20 mx-1" />
         <div className="w-1 h-1 rounded-full bg-white/40 mx-1" />
         <div className="w-1 h-1 rounded-full bg-white/20 mx-1" />
      </div>
    </div>
  );
};

export default DialogueBox;
