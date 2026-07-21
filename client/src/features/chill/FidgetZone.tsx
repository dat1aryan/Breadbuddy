import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatBlock } from '../../components/ui/StatBlock';
import { useToast } from '../../hooks/useToast';

interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export function FidgetZone() {
  const [activeTab, setActiveTab] = useState<'spinner' | 'squishy' | 'popit'>('spinner');
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  
  // Local score increment queue for debouncing
  const pendingPoints = useRef<number>(0);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial score
  useEffect(() => {
    api.getFidgetScore()
      .then((data) => {
        setScore(data.fidget_score);
      })
      .catch(() => toast.error('Failed to retrieve fidget score'))
      .finally(() => setLoading(false));

    return () => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
    };
  }, []);

  // Debounced score sync
  const addPoints = (pts: number = 1) => {
    setScore((prev) => prev + pts);
    pendingPoints.current += pts;

    if (syncTimeout.current) clearTimeout(syncTimeout.current);

    syncTimeout.current = setTimeout(() => {
      if (pendingPoints.current > 0) {
        const ptsToSend = pendingPoints.current;
        api.incrementFidgetScore(ptsToSend)
          .then((data) => {
            setScore(data.fidget_score);
            pendingPoints.current = 0;
          })
          .catch((err) => {
            console.error('Failed to sync score:', err);
          });
      }
    }, 1500);
  };

  // ====================
  // 1. FIDGET SPINNER
  // ====================
  const [rotation, setRotation] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const requestRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const cumulativeAngle = useRef<number>(0);

  const spin = (boost: number = 15) => {
    setSpeed((s) => Math.min(s + boost, 80));
    addPoints(2);
  };

  const animateSpinner = (time: number) => {
    if (prevTimeRef.current !== undefined) {
      setSpeed((s) => {
        const nextSpeed = s * 0.982;
        if (nextSpeed < 0.1) return 0;
        
        setRotation((r) => (r + nextSpeed) % 360);
        
        cumulativeAngle.current += nextSpeed;
        if (cumulativeAngle.current >= 360) {
          const rotationsCompleted = Math.floor(cumulativeAngle.current / 360);
          cumulativeAngle.current %= 360;
          addPoints(rotationsCompleted);
        }
        
        return nextSpeed;
      });
    }
    prevTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateSpinner);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateSpinner);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // ====================
  // 2. SQUISHY LOAF
  // ====================
  const [isSquished, setIsSquished] = useState<boolean>(false);
  const [loafExpression, setLoafExpression] = useState<'calm' | 'squished' | 'happy'>('calm');
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const floatId = useRef<number>(0);

  const handleSquishStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsSquished(true);
    setLoafExpression('squished');
    addPoints(1);
  };

  const handleSquishEnd = () => {
    if (!isSquished) return;
    setIsSquished(false);
    setLoafExpression('happy');

    const phrases = ['zen mode 🧘', 'squish! 🍞', 'stress gone ✨', 'satisfying 💖', '+1 chill'];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    const id = floatId.current++;
    
    setFloatTexts((prev) => [...prev, { id, text, x: 120 + (Math.random() - 0.5) * 40, y: 80 }]);
    setTimeout(() => {
      setFloatTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1500);

    setTimeout(() => {
      setLoafExpression((curr) => (curr === 'happy' ? 'calm' : curr));
    }, 800);
  };

  // ====================
  // 3. POP IT!
  // ====================
  const [bubbles, setBubbles] = useState<boolean[]>(Array(9).fill(false));
  const [justReset, setJustReset] = useState<boolean>(false);

  const handlePop = (index: number) => {
    if (bubbles[index]) return;
    const newBubbles = [...bubbles];
    newBubbles[index] = true;
    setBubbles(newBubbles);
    addPoints(1);

    if (newBubbles.every((b) => b)) {
      setTimeout(() => {
        setJustReset(true);
        setBubbles(Array(9).fill(false));
        addPoints(5);
        setTimeout(() => setJustReset(false), 800);
      }, 800);
    }
  };

  const resetPopIt = () => {
    setBubbles(Array(9).fill(false));
    addPoints(1);
  };

  const rpm = Math.round((speed * 60) / 6);

  return (
    <div className="flex flex-col">
      {/* 1. Header / Zen Score Panel */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-bb-border pb-3.5 select-none">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-bb-violet" />
          <h3 className="font-display font-black text-bb-text-primary tracking-tight text-sm">Chill Zone</h3>
          <Badge variant="lime">Fidget & Chill</Badge>
        </div>
        <StatBlock
          label="Zen Score"
          value={loading ? '...' : `${score.toLocaleString()}`}
          sub="pts"
          accent="lime"
          size="sm"
          className="w-36 py-2 px-3"
        />
      </div>

      {/* 2. Tab Selector Bar */}
      <div className="flex bg-bb-surface border-2 border-bb-border p-1 rounded-bb-sm gap-1 mb-6">
        {[
          { id: 'spinner', label: 'Spinner 🌀' },
          { id: 'squishy', label: 'Squishy Loaf 🍞' },
          { id: 'popit', label: 'Pop It! 🫧' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-bb-xs text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-bb-violet text-bb-violet-fg border-black'
                : 'bg-transparent text-bb-text-muted border-transparent hover:text-bb-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Play Area Unified Card Container */}
      <Card
        accent={activeTab === 'squishy' && isSquished ? 'lime' : 'none'}
        className="h-64 flex flex-col items-center justify-center relative p-4 transition-all duration-150"
      >
        {/* SPINNER */}
        {activeTab === 'spinner' && (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <div 
              onClick={() => spin(22)}
              className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-100"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* 3. Spinner SVG Flat Accent Colors */}
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="16" fill="var(--bb-lime)" stroke="var(--bb-border)" strokeWidth="2" />
                <circle cx="60" cy="60" r="8" fill="#121212" />
                
                <path d="M60 16C50 16 46 28 50 36C54 44 66 44 70 36C74 28 70 16 60 16Z" fill="var(--bb-violet)" />
                <circle cx="60" cy="30" r="10" fill="#121212" stroke="var(--bb-border)" strokeWidth="2" />
                <circle cx="60" cy="30" r="4" fill="var(--bb-violet)" />

                <path d="M21.9 82C16.9 73.3 29.5 68.3 35.3 75.2C41.1 82.2 32.1 92.6 26.3 89.2C20.5 85.8 26.9 90.7 21.9 82Z" fill="var(--bb-violet)" />
                <circle cx="34" cy="76.2" r="10" fill="#121212" stroke="var(--bb-border)" strokeWidth="2" />
                <circle cx="34" cy="76.2" r="4" fill="var(--bb-coral)" />

                <path d="M98.1 82C103.1 73.3 90.5 68.3 84.7 75.2C78.9 82.2 87.9 92.6 93.7 89.2C99.5 85.8 93.1 90.7 98.1 82Z" fill="var(--bb-violet)" />
                <circle cx="86" cy="76.2" r="10" fill="#121212" stroke="var(--bb-border)" strokeWidth="2" />
                <circle cx="86" cy="76.2" r="4" fill="var(--bb-lime)" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center gap-1.5">
              {/* 4. Turbo Spin Button */}
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => spin(35)}
                leftIcon={<Zap size={12} />}
                className="font-mono"
              >
                turbo spin
              </Button>
              <p className="text-[10px] text-bb-text-muted font-mono font-numeric">{rpm > 0 ? `${rpm} RPM` : 'Click or tap to spin'}</p>
            </div>
          </div>
        )}

        {/* SQUISHY LOAF */}
        {activeTab === 'squishy' && (
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <div
              onMouseDown={handleSquishStart}
              onMouseUp={handleSquishEnd}
              onMouseLeave={handleSquishEnd}
              onTouchStart={handleSquishStart}
              onTouchEnd={handleSquishEnd}
              className="cursor-pointer select-none transition-all duration-150 relative z-10 flex flex-col items-center"
              style={{
                transform: isSquished 
                  ? 'scale(1.25, 0.58) translateY(24px)' 
                  : 'scale(1, 1) translateY(0)',
              }}
            >
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                <path d="M10 50C10 25 35 15 60 15C85 15 110 25 110 50C110 75 90 80 60 80C30 80 10 75 10 50Z" fill="url(#loaf-grad)" stroke="#6F4E37" strokeWidth="2.5" />
                <path d="M15 50C15 32 38 23 60 23C82 23 105 32 105 50C105 68 85 73 60 73C35 73 15 68 15 50Z" fill="url(#inner-loaf)" />
                
                {loafExpression === 'calm' && (
                  <>
                    <path d="M42 48Q46 51 50 48" stroke="#331A00" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M70 48Q74 51 78 48" stroke="#331A00" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M58 55Q60 57 62 55" stroke="#331A00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </>
                )}
                {loafExpression === 'squished' && (
                  <>
                    <path d="M42 44L48 50L42 56" stroke="#331A00" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M78 44L72 50L78 56" stroke="#331A00" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <circle cx="60" cy="56" r="4.5" fill="#C43B3B" />
                  </>
                )}
                {loafExpression === 'happy' && (
                  <>
                    <circle cx="45" cy="46" r="3" fill="#331A00" />
                    <circle cx="75" cy="46" r="3" fill="#331A00" />
                    <path d="M56 52Q60 55 64 52" stroke="#331A00" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </>
                )}
                
                <circle cx="36" cy="52" r="5" fill="#FF71CE" fillOpacity="0.4" />
                <circle cx="84" cy="52" r="5" fill="#FF71CE" fillOpacity="0.4" />
                
                <defs>
                  <linearGradient id="loaf-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D2B48C" />
                    <stop offset="100%" stopColor="#8B5A2B" />
                  </linearGradient>
                  <linearGradient id="inner-loaf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFDD0" />
                    <stop offset="100%" stopColor="#F5DEB3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <p className="text-[10px] text-bb-text-muted mt-4 text-center font-mono pointer-events-none uppercase tracking-wide">
              {isSquished ? 'SQUEEZING' : 'Click and hold to squish'}
            </p>

            {floatTexts.map((ft) => (
              <span
                key={ft.id}
                className="absolute text-[10px] font-extrabold text-bb-lime tracking-wider uppercase pointer-events-none animate-bb-slide-up"
                style={{ left: ft.x, top: ft.y }}
              >
                {ft.text}
              </span>
            ))}
          </div>
        )}

        {/* POP IT */}
        {activeTab === 'popit' && (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            {/* 6. Pop It Container */}
            <div className={`grid grid-cols-3 gap-2.5 p-3 border-2 border-bb-border rounded-bb-sm bg-bb-surface relative transition-all duration-300 ${justReset ? 'scale-95 opacity-50 border-bb-lime bg-bb-lime' : ''}`}>
              {bubbles.map((popped, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePop(idx)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer ${
                    popped 
                      /* 8. Popped Bubble (no inset-shadow) */
                      ? 'bg-bb-bg border-2 border-bb-border text-bb-text-muted/40 scale-90' 
                      /* 7. Unpopped Bubble (no animate-emoji-pop) */
                      : 'bg-bb-violet border-2 border-black active:scale-95 hover:scale-105 text-bb-violet-fg'
                  }`}
                >
                  <span className={`text-[9px] font-extrabold font-mono transition-opacity ${popped ? 'opacity-30' : 'opacity-85'}`}>
                    {popped ? '•' : 'pop'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* 9. Reset Wrap Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={resetPopIt}
                leftIcon={<RefreshCw size={12} />}
                className="font-mono"
              >
                Reset Wrap
              </Button>
              <p className="text-[10px] text-bb-text-muted font-mono font-numeric">
                {bubbles.filter(b => b).length}/9 popped
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
