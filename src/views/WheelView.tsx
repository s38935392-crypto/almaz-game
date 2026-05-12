import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
 
const PRIZES = [10, 5, 7, 0, -10, 7, 5, 10];
const COLORS = [
  'bg-red-500', 'bg-emerald-400', 'bg-purple-500', 'bg-red-500',
  'bg-yellow-400', 'bg-blue-400', 'bg-orange-500', 'bg-purple-400'
];
const HEX_COLORS = [
  '#ef4444', '#34d399', '#a855f7', '#ef4444',
  '#facc15', '#60a5fa', '#f97316', '#c084fc'
];
 
export const WheelView: React.FC = () => {
  const { user, spinWheel, onlineCount, updateDiamonds } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
 
  const handleSpin = async () => {
    if (isSpinning || user.diamonds < 2) return;
 
    setIsSpinning(true);
    setResult(null);
 
    const winValue = spinWheel();
 
    const prizeIndex = PRIZES.findIndex(p => p === winValue);
    const segmentAngle = 360 / PRIZES.length;
    const randomSpins = 5 + Math.random() * 5;
    const targetSegment = prizeIndex !== -1 ? prizeIndex : 4;
 
    const newRotation = rotation + randomSpins * 360 + (360 - targetSegment * segmentAngle);
    setRotation(newRotation);
 
    await controls.start({
      rotate: newRotation,
      transition: { duration: 4, ease: [0.15, 0.0, 0.1, 1.0] }
    });
 
    updateDiamonds(winValue);
    setIsSpinning(false);
    setResult(winValue);
  };
 
  // SVG-based wheel for precise rendering with large numbers
  const size = 288; // w-72 = 288px
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const numSegments = PRIZES.length;
  const angleStep = (2 * Math.PI) / numSegments;
 
  const getSegmentPath = (index: number) => {
    const startAngle = index * angleStep - Math.PI / 2;
    const endAngle = startAngle + angleStep;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };
 
  const getTextPosition = (index: number) => {
    const angle = index * angleStep - Math.PI / 2 + angleStep / 2;
    const textR = r * 0.65;
    return {
      x: cx + textR * Math.cos(angle),
      y: cy + textR * Math.sin(angle),
      angle: (index * (360 / numSegments)) + (360 / numSegments / 2) + 90
    };
  };
 
  return (
    <div className="px-4 py-6 flex flex-col items-center pb-32">
      {/* Top bar */}
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
 
      {/* The Wheel - SVG based with large numbers */}
      <div className="relative mb-12" style={{ width: size, height: size }}>
        {/* Pointer arrow on the right */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="w-10 h-10 bg-blue-400 [clip-path:polygon(100%_50%,0_0,0_100%)]"></div>
        </div>
 
        {/* Center logo on top */}
        <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full z-10 shadow-lg flex items-center justify-center border-4 border-blue-100" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' }}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">FP</div>
        </div>
 
        <motion.div
          animate={controls}
          className="w-full h-full"
          style={{ originX: '50%', originY: '50%' }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer border circle */}
            <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#60a5fa" strokeWidth="6" />
 
            {PRIZES.map((prize, i) => {
              const textPos = getTextPosition(i);
              const isNegative = prize < 0;
              const displayVal = prize === 0 ? '0' : (prize > 0 ? `+${prize}` : `${prize}`);
 
              return (
                <g key={i}>
                  {/* Segment */}
                  <path
                    d={getSegmentPath(i)}
                    fill={HEX_COLORS[i]}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Diamond icon area */}
                  <text
                    x={textPos.x}
                    y={textPos.y - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="900"
                    transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                  >
                    💎
                  </text>
                  {/* Prize number - BIG */}
                  <text
                    x={textPos.x}
                    y={textPos.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={prize === 0 || Math.abs(prize) >= 10 ? "20" : "22"}
                    fontWeight="900"
                    fontFamily="system-ui, sans-serif"
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth="1"
                    paintOrder="stroke"
                    transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                  >
                    {displayVal}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>
 
      {/* Recent Winners */}
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
 
      {/* Result Modal */}
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
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              {result > 0 ? 'TABRIKLAYMIZ!' : result === 0 ? 'YUTQAZMADINGIZ!' : 'OMADSIZLIK!'}
            </h2>
            <p className="text-gray-500 mb-6 font-medium">
              {result > 0 ? 'Siz o\'yinda yutdingiz:' : result === 0 ? 'Bu safar 0 almaz:' : 'Almaz ayrildi:'}
            </p>
            <div className={`flex items-center gap-2 mb-8 px-6 py-3 rounded-2xl border ${
              result > 0 ? 'bg-blue-50 border-blue-100' : result === 0 ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100'
            }`}>
              <span className={`text-4xl font-black ${result > 0 ? 'text-blue-600' : result === 0 ? 'text-gray-500' : 'text-red-500'}`}>
                {result > 0 ? `+${result}` : result}
              </span>
              <Diamond size={24} className={`${result > 0 ? 'text-blue-600 fill-blue-600' : result === 0 ? 'text-gray-400 fill-gray-400' : 'text-red-400 fill-red-400'}`} />
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
