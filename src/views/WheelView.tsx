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
  const { user, spinWheel, updateDiamonds } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const controls = useAnimation();

  const handleSpin = async () => {
    if (!user || isSpinning || user.balance < 2) return;

    setIsSpinning(true);
    setResult(null);

    const winValue = spinWheel();
    
    await controls.start({
      rotate: 3600 + (Math.random() * 360),
      transition: { duration: 4, ease: "circOut" }
    });

    await updateDiamonds(winValue - 2);
    setResult(winValue);
    setIsSpinning(false);
  };

  if (!user) return <div className="p-10 text-center">Yuklanmoqda...</div>;

  return (
    <div className="flex flex-col items-center p-6 space-y-8">
      <div className="relative w-72 h-72">
        <motion.div 
            animate={controls}
            className="w-full h-full rounded-full border-8 border-gray-800 relative overflow-hidden"
        >
            {PRIZES.map((prize, i) => (
                <div key={i} className={`absolute w-full h-full ${COLORS[i]}`} 
                     style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)', transform: `rotate(${i * 45}deg)` }}>
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 font-bold text-white">{prize}</span>
                </div>
            ))}
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-xl font-bold">Balans: {user.balance} 💎</p>
        <button 
          onClick={handleSpin}
          disabled={isSpinning || user.balance < 2}
          className="mt-4 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black"
        >
          {isSpinning ? 'AYLANMOQDA...' : 'AYLANTIRISH (2 💎)'}
        </button>
      </div>
      {result !== null && <div className="text-xl font-bold text-blue-600">Yutuq: {result} 💎</div>}
    </div>
  );
};
