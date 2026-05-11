import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';

const PRIZES = [10, 5, 7, 0, -10, 7, 5, 10];
const COLORS = [
  'bg-red-500', 'bg-emerald-400', 'bg-purple-500', 'bg-red-500', 
  'bg-yellow-400', 'bg-blue-400', 'bg-orange-500', 'bg-purple-400'
];

export const WheelView: React.FC = () => {
  const { user, spinWheel, onlineCount, updateDiamonds } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const controls = useAnimation();

  const handleSpin = async () => {
    if (isSpinning || user.diamonds < 2) return;
    
    setIsSpinning(true);
    setResult(null);

    const winValue = spinWheel(); 
    
    // Find segment index for the winValue
    const prizeIndex = PRIZES.findIndex(p => p === winValue);
    
    // Random rotations (5-10 full spins) + segment targeted to result
    const segmentAngle = 360 / PRIZES.length;
    const randomSpins = 5 + Math.random() * 5;
    const targetSegment = prizeIndex !== -1 ? prizeIndex : 4; // fallback to 0 if not found
    
    // Total rotation to land on the prize (offset by 90 deg because of wheel orientation)
    const totalRotation = randomSpins * 360 + (360 - (targetSegment * segmentAngle));

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4, ease: [0.15, 0.0, 0.1, 1.0] }
    });

    // Update diamonds after animation finishes
    updateDiamonds(winValue);
    
    setIsSpinning(false);
    setResult(winValue);
  };

  return (
    <div className="px-4 py-6 flex flex-col items-center pb-32">
      <div className="w-full flex items-center justify-between mb-8">
         <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
            <span className="text-xs text-blue-400 font-bold">{onlineCount}</span>
            <span className="text-[10px] text-blue-300 font-bold uppercase">Online</span>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
               <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-white shadow-sm overflow-hidden opacity-50">
                  <Diamond size={20} className="text-blue-500 fill-blue-500" />
               </div>
            ))}
         </div>
      </div>

      {/* The Wheel */}
      <div className="relative w-72 h-72 mb-12">
        {/* Pointer */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="w-10 h-10 bg-blue-400 [clip-path:polygon(100%_50%,0_0,0_100%)]"></div>
        </div>

        {/* Center Logo */}
        <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full z-10 shadow-lg flex items-center justify-center border-4 border-blue-100">
           <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xl">FP</div>
        </div>

        <motion.div 
          animate={controls}
          className="w-full h-full rounded-full border-[6px] border-blue-400 overflow-hidden relative shadow-2xl"
        >
          {PRIZES.map((prize, i) => (
            <div 
              key={i}
              className={`absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-center ${COLORS[i]}`}
              style={{ 
                transform: `rotate(${i * (360 / PRIZES.length)}deg)`,
                clipPath: 'polygon(0 50%, 100% 0, 100% 100%)'
              }}
            >
              <div className="flex flex-col items-center gap-1 transform rotate-90 translate-x-12">
                <Diamond size={18} className="text-white fill-white" />
                <span className="text-[10px] font-black text-white">{prize.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Winners List (Recent) */}
      <div className="w-full space-y-3">
        {[2500, 1000, 500].map((win, i) => (
          <div key={i} className="flex justify-between items-center opacity-60">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-800">Begzod Begmuratov</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-yellow-500">+{win}</span>
                    <Diamond size={8} className="text-blue-400 fill-blue-400" />
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Spin Button */}
      <div className="fixed bottom-24 left-0 right-0 px-4">
        <button 
          onClick={handleSpin}
          disabled={isSpinning || user.diamonds < 2}
          className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
            isSpinning || user.diamonds < 2 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-blue-500 text-white shadow-blue-200'
          }`}
        >
          {isSpinning ? 'AYLANMOQDA...' : 'AYLANTIRISH'} 
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Diamond size={16} className="fill-white" />
            <span className="text-lg">2</span>
          </div>
        </button>
      </div>

      {/* Result Modal Overlay */}
      {result !== null && !isSpinning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={() => setResult(null)}
        >
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl max-w-xs w-full">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Diamond size={40} className="text-blue-500 fill-blue-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">TABRIKLAYMIZ!</h2>
            <p className="text-gray-500 mb-6 font-medium">Siz o'yinda yutdingiz:</p>
            <div className="flex items-center gap-2 mb-8 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
              <span className="text-4xl font-black text-blue-600">{result}</span>
              <Diamond size={24} className="text-blue-600 fill-blue-600" />
            </div>
            <button 
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-95"
              onClick={() => setResult(null)}
            >
              DAVOM ETISH
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
