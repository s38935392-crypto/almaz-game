import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, Users, Copy, Share2, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

// Supabase ulanishi (image_d2e4ee.png dagi ma'lumotlaringiz asosida)
const supabaseUrl = 'https://kyqudwhiwrrsfcpxjyef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0UmVmIjoia3lxdWR3aGl3cnJzZmNweGp5ZWYiLCJpYXQiOjE3NDcwNzE4NDMsImV4cCI6MjA2MjY0Nzg0M30.eyJpZCI6ImJmYmZzZzI3LWJmYmYtNGJmZi04YmZmLWJmYmZzZzI3YmZiZiIsInJvbGUiOiJhbm9uIn0.eyJpZCI6ImJmYmZzZzI3LWJmYmYtNGJmZi04YmZmLWJmYmZzZzI3YmZiZiIsInJvbGUiOiJhbm9uIn0'; 
const supabase = createClient(supabaseUrl, supabaseKey);

export const ReferralsView: React.FC = () => {
  const { user, referrals } = useApp();
  const [copied, setCopied] = useState(false);
  const [realReferrals, setRealReferrals] = useState<any[]>([]);

  // Telegram WebApp orqali foydalanuvchi ID-sini olish
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  const myTelegramId = tgUser?.id || user.id; // Agar TG bo'lmasa, context'dagi ID

  const botUsername = 'FeeFireomadcharxpalakbot';
  // Referral link: foydalanuvchining shaxsiy ID-si bilan
  const referralLink = `https://t.me/${botUsername}?start=${myTelegramId}`;

  // Supabase-dan real do'stlar ro'yxatini olish
  useEffect(() => {
    const fetchReferrals = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('referred_by', myTelegramId);
      
      if (!error && data) {
        setRealReferrals(data);
      }
    };
    fetchReferrals();
  }, [myTelegramId]);

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
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const totalEarned = realReferrals.length * 5;
  const progressPercent = Math.min((realReferrals.length / 15) * 100, 100);

  return (
    <div className="px-4 py-6 space-y-6 pb-40">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-800 uppercase">Do'stlarni taklif qil</h2>
        <p className="text-gray-400 text-sm font-medium">
          Har bir do'st uchun 5 <Diamond size={12} className="inline fill-blue-400 text-blue-400" /> oling!
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold opacity-80 mb-1">Taklif qilinganlar</span>
            <span className="text-3xl font-black flex items-center gap-2">
              {realReferrals.length} / 15
              <Users size={24} className="opacity-50" />
            </span>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
            <Share2 size={28} />
          </div>
        </div>
        <div className="mt-4 w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-2xl font-black text-gray-800">{realReferrals.length}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Do'stlar</span>
        </div>
        <div className="bg-orange-500 rounded-3xl p-5 shadow-lg flex flex-col items-center text-white">
          <span className="text-2xl font-black">{totalEarned}</span>
          <span className="text-[10px] uppercase font-bold opacity-80 mt-1">Jami bonus</span>
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800 px-1">Do'stlar ro'yxati</h3>
        {realReferrals.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center text-center border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Hali hech kim yo'q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {realReferrals.map((ref, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold">
                    {ref.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-bold text-gray-800">@{ref.username || 'User'}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-black">
                  +5 <Diamond size={12} className="fill-green-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky */}
      <div className="fixed bottom-24 left-0 right-0 px-4 space-y-3 bg-white/80 backdrop-blur-md py-4">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 truncate mr-4">{referralLink}</span>
          <button onClick={copyToClipboard} className="text-blue-500 p-1">
            {copied ? <CheckCircle2 size={22} /> : <Copy size={22} />}
          </button>
        </div>
        <button
          onClick={handleShare}
          className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          DO'STLARGA YUBORISH
        </button>
      </div>
    </div>
  );
};
