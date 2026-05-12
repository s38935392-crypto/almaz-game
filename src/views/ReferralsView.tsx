import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, Users, Copy, Share2, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
 
export const ReferralsView: React.FC = () => {
  const { user, updateDiamonds, referrals, addReferral } = useApp();
  const [copied, setCopied] = useState(false);
 
  const botUsername = 'your_bot'; // O'zingizning bot username
  const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
 
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  const handleShare = () => {
    const text = encodeURIComponent(
      `🎁 Almaz Wheel & Earn o'yinida bepul almaz ishlash!\n\n💎 Qo'shilsang 10 almaz sovg'a!\n\n👇 Bosib kir:`
    );
    const url = encodeURIComponent(referralLink);
    // Telegram share URL - opens Telegram with contact picker
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };
 
  const totalEarned = referrals.length * 5;
  const progressPercent = Math.min((referrals.length / 15) * 100, 100);
 
  return (
    <div className="px-4 py-6 space-y-6 pb-40">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-800">DO'STLARNI TAKLIF QILING</h2>
        <p className="text-gray-400 text-sm font-medium">
          Har bir do'st uchun 5 <Diamond size={12} className="inline fill-blue-400 text-blue-400" /> oling!
        </p>
      </div>
 
      {/* Invite Progress Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold opacity-80 mb-1 leading-none">Taklif qilinganlar</span>
            <span className="text-3xl font-black leading-none flex items-center gap-2">
              {referrals.length} / 15
              <Users size={24} className="opacity-50" />
            </span>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Share2 size={32} />
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-10">
          <Users size={120} />
        </div>
      </div>
 
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3">
            <Users size={24} />
          </div>
          <span className="text-2xl font-black text-gray-800 leading-none">{referrals.length}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Do'stlar</span>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-5 shadow-lg flex flex-col items-center text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Diamond size={24} className="fill-white" />
          </div>
          <span className="text-2xl font-black leading-none">{totalEarned}</span>
          <span className="text-[10px] uppercase font-bold opacity-80 mt-1">Almazlar</span>
        </div>
      </div>
 
      {/* Friends List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Do'stlar ro'yxati</h3>
 
        {referrals.length === 0 ? (
          <div className="bg-gray-50/50 rounded-3xl p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-200 mb-4">
              <Users size={32} />
            </div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Hozircha do'stlar yo'q</p>
            <p className="text-[10px] text-gray-300 font-medium max-w-xs">
              Do'stlarni taklif qiling va har biri uchun 5 almazdan oling!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref, i) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ref.id}`} alt="" className="w-full h-full" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800">{ref.name}</span>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ref.joinedAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-black text-green-600">+5</span>
                  <Diamond size={12} className="text-green-500 fill-green-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
 
      {/* Fixed bottom: link + share button */}
      <div className="fixed bottom-24 left-0 right-0 px-4 space-y-3">
        {/* Referral link copy row */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col flex-1 mr-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Sizning referal havolangiz</span>
            <span className="text-xs font-medium text-gray-600 truncate">{referralLink}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className={`p-2.5 rounded-xl transition-all ${copied ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400 active:bg-blue-50 active:text-blue-500'}`}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={20} />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Copy size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
 
        {/* Telegram Share Button - opens contact picker */}
        <button
          onClick={handleShare}
          className="w-full py-5 bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Share2 size={22} />
          DO'STLARGA TARQATISH
        </button>
      </div>
 
      {/* Info */}
      <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-50">
        <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-500 font-medium leading-relaxed">
          "Do'stlarga tarqatish" tugmasini bosib Telegram orqali do'stlaringizni tanlang.
          Do'stingiz qo'shilgandan so'ng sizga avtomatik 5 almaz o'tkaziladi.
        </p>
      </div>
    </div>
  );
};
