
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Optional: Play sound here
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="bg-[#0F0F0F]/50 border border-white/5 rounded-sm p-5 backdrop-blur-sm relative overflow-hidden">
      {/* Active State Background Pulse */}
      {isActive && (
        <div className="absolute inset-0 bg-white/5 animate-pulse-slow pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-white">
          <Zap size={16} className={isActive ? "text-yellow-400 fill-yellow-400" : "text-navily-muted"} />
          <h2 className="text-sm font-bold uppercase tracking-widest">Focus Cycle</h2>
        </div>
        {isActive && (
           <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="text-5xl font-mono font-bold text-white tracking-widest tabular-nums drop-shadow-lg">
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#1A1A1A] rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${100 - progress}%` }}
          />
        </div>

        <div className="flex gap-4 mt-6 w-full justify-center">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-2 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isActive 
                ? 'bg-navily-metal text-white hover:bg-white/10 border border-white/10' 
                : 'bg-white text-black hover:bg-gray-200 shadow-lg'
            }`}
          >
            {isActive ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-2 rounded-sm text-navily-muted hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
