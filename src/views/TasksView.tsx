import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, CheckCircle2, Clock, ExternalLink, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const TasksView: React.FC = () => {
  const { tasks, completeTask, user, getDailyBonusTimeLeft, claimDailyBonus } = useApp();
  const [timeLeft, setTimeLeft] = useState(getDailyBonusTimeLeft());
  const [dailyClaimed, setDailyClaimed] = useState(getDailyBonusTimeLeft() > 0);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = getDailyBonusTimeLeft();
      setTimeLeft(left);
      setDailyClaimed(left > 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [getDailyBonusTimeLeft]);

  const handleTaskClick = (task: any) => {
    if (task.type === 'subscription') {
      if (task.completed) return;
      // Open Telegram channel
      window.open('https://t.me/FreeFireTopSavdolar', '_blank');
      // Give reward
      completeTask(task.id);
    } else if (task.type === 'daily') {
      if (dailyClaimed) return;
      const ok = claimDailyBonus();
      if (ok) {
        setDailyClaimed(true);
        setTimeLeft(24 * 3600);
      }
    } else if (task.type === 'referral') {
      // Share to Telegram
      const refLink = `https://t.me/your_bot?start=${user.referralCode}`;
      const text = encodeURIComponent(`🎁 Bepul almaz ishlash! Mening havolam orqali kir va 10 almaz ol:\n${refLink}`);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`, '_blank');
    }
  };

  const getTaskButton = (task: any) => {
    if (task.type === 'subscription') {
      if (task.completed) {
        return (
          <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed">
            <CheckCircle2 size={14} />
            Bajarildi
          </div>
        );
      }
      return (
        <button
          onClick={() => handleTaskClick(task)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 active:scale-95 transition-all"
        >
          <ExternalLink size={14} />
          Obuna bo'lish
        </button>
      );
    }

    if (task.type === 'daily') {
      if (dailyClaimed && timeLeft > 0) {
        return (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-500 rounded-xl text-xs font-bold border border-orange-100">
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        );
      }
      return (
        <button
          onClick={() => handleTaskClick(task)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold shadow-md shadow-green-200 active:scale-95 transition-all"
        >
          <Diamond size={14} className="fill-white" />
          Olish
        </button>
      );
    }

    if (task.type === 'referral') {
      return (
        <button
          onClick={() => handleTaskClick(task)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 active:scale-95 transition-all"
        >
          <Share2 size={14} />
          Tarqatish
        </button>
      );
    }

    return null;
  };

  const getTaskIcon = (task: any) => {
    if (task.type === 'subscription') {
      return (
        <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-2 border-blue-200 shadow-sm">
          <span className="text-[9px] text-blue-700 font-black leading-none text-center px-1">FREE FIRE TOP</span>
        </div>
      );
    }
    if (task.type === 'daily') {
      return (
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <Clock size={24} className="text-green-500" />
        </div>
      );
    }
    if (task.type === 'referral') {
      return (
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
          <Share2 size={24} className="text-purple-500" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
        <Diamond size={24} className="fill-blue-500 text-blue-500" />
      </div>
    );
  };

  const getTaskSubtitle = (task: any) => {
    if (task.type === 'subscription') return 'Kanalga obuna bo\'lish uchun';
    if (task.type === 'daily') return dailyClaimed && timeLeft > 0 ? `Keyingisi: ${formatTime(timeLeft)}` : 'Har 24 soatda oling';
    if (task.type === 'referral') return 'Do\'stlarga tarqatib almaz oling';
    return 'Vazifa uchun';
  };

  return (
    <div className="px-4 py-4 space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-1 uppercase tracking-tight leading-tight">
            BEPUL ALMAZ <br /> ISHLASH!
          </h2>
          <p className="text-xs text-blue-100 font-medium opacity-90">
            Vazifalarni bajaring va 5000+ gacha <br /> almaz oling.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold">
            <Diamond size={10} className="fill-white" />
            Shartlarni bajarib sovg'a oling
          </div>
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20">
          <Diamond size={100} className="fill-white" />
        </div>
      </div>

      {/* Task Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['Xit', 'Promo', 'Eksklyuziv', 'Yangi', 'Yana'].map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${cat === 'Xit' ? 'bg-white shadow-sm border border-gray-100 text-gray-800' : 'text-gray-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">
          Vazifalarni bajarib - ALMAZ oling!
        </h3>

        {tasks.map((task, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={task.id}
            className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50"
          >
            <div className="flex items-center gap-4">
              {getTaskIcon(task)}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{task.title}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-gray-900">+{task.reward}</span>
                  <Diamond size={12} className="text-blue-500 fill-blue-500" />
                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                    {getTaskSubtitle(task)}
                  </span>
                </div>
              </div>
            </div>

            {getTaskButton(task)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
