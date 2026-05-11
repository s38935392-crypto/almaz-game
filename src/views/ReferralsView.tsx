import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, Users, Copy, Share2, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const ReferralsView: React.FC = () => {
  const { user, updateDiamonds } = useApp();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://t.me/your_bot?start=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFakeReferral = () => {
    // Demonstration purposes
    updateDiamonds(5);
    alert('Do\'st taklif qilindi! +5 Almaz');
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-800">DO'STLARNI TAKLIF QILING</h2>
        <p className="text-gray-400 text-sm font-medium">Hary bir do'stingiz uchun 5 <Diamond size={12} className="inline fill-blue-400 text-blue-400" /> oling!</p>
      </div>

      {/* Invite Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold opacity-80 mb-1 leading-none">Do'stlarni taklif qilish</span>
            <span className="text-3xl font-black leading-none flex items-center gap-2">
               0 / 15
               <Users size={24} className="opacity-50" />
            </span>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Share2 size={32} />
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
           <div className="w-0 h-full bg-white rounded-full"></div>
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
           <span className="text-2xl font-black text-gray-800 leading-none">0</span>
           <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Do'stlar</span>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-5 shadow-lg flex flex-col items-center text-white">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Diamond size={24} className="fill-white" />
           </div>
           <span className="text-2xl font-black leading-none">0</span>
           <span className="text-[10px] uppercase font-bold opacity-80 mt-1">Almazlar</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-800">Do'stlar ro'yxati</h3>
        
        {/* Empty State */}
        <div className="bg-gray-50/50 rounded-3xl p-10 flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-200 mb-4">
              <Users size={32} />
           </div>
           <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Hozircha do'stlar yo'q</p>
           <p className="text-[10px] text-gray-300 font-medium max-w-xs">Do'stlarni taklif qiling va har biri uchun 5 almazdan oling!</p>
        </div>
      </div>

      {/* Referral Link & Action */}
      <div className="fixed bottom-24 left-0 right-0 px-4 space-y-3">
         <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Sizning referal silkangiz</span>
               <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]">{referralLink}</span>
            </div>
            <button 
               onClick={copyToClipboard}
               className={`p-2.5 rounded-xl transition-all ${copied ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400 active:bg-blue-50 active:text-blue-500'}`}
            >
               {copied ? <Copy size={20} className="scale-75" /> : <Copy size={20} />}
            </button>
         </div>

         <button 
           onClick={handleFakeReferral}
           className="w-full py-5 bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
         >
           DO'STLARNI TAKLIF QILISH
         </button>
      </div>

      {/* Info Info */}
      <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-50">
         <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
         <p className="text-[10px] text-blue-500 font-medium leading-relaxed">
            Do'stingiz botdan ro'yxatdan o'tganidan so'ng sizga avtomatik ravishda 5 almaz o'tkaziladi.
         </p>
      </div>
    </div>
  );
};
