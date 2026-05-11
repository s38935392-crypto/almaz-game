import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { user, updateDiamonds } = useApp();
  const [ffId, setFfId] = useState('');
  const [amount, setAmount] = useState('100');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount);

    if (!ffId) {
      setErrorMsg("Free Fire ID kiritilmadi!");
      setStatus('error');
      return;
    }

    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      setErrorMsg("Minimal yechish 100 Almaz!");
      setStatus('error');
      return;
    }

    if (user.diamonds < withdrawAmount) {
      setErrorMsg("Hisobingizda mablag' yetarli emas!");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          freeFireId: ffId,
          amount: withdrawAmount,
          diamondsBefore: user.diamonds,
          diamondsAfter: user.diamonds - withdrawAmount
        })
      });

      if (response.ok) {
        updateDiamonds(-withdrawAmount);
        setStatus('success');
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Xatolik yuz berdi");
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server bilan bog'lanishda xatolik");
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-12 sm:pb-8 shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Diamond size={32} className="text-blue-500 fill-blue-500" />
              </div>
              <h2 className="text-xl font-black text-gray-800 uppercase">Almazlarni yechish</h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Free Fire hisobingizga o'tkaziladi</p>
            </div>

            {status === 'success' ? (
              <div className="py-8 flex flex-col items-center text-center">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">So'rovingiz qabul qilindi!</h3>
                <p className="text-sm text-gray-400 mt-2">Tez orada adminga xabar boradi va almazlar tashlab beriladi.</p>
                <button 
                  onClick={onClose}
                  className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-2xl animate-pulse"
                >
                  TUSHUNARLI
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="mt-8 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Gamer ID (FF ID)</label>
                  <input 
                    type="text" 
                    value={ffId}
                    onChange={(e) => setFfId(e.target.value)}
                    placeholder="Masalan: 12345678"
                    className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Miqdor (Minimal 100)</label>
                  <div className="relative mt-1">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="100"
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-800 pr-16"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-50">
                      <Diamond size={16} className="text-blue-500 fill-blue-500" />
                    </div>
                  </div>
                </div>

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3"
                  >
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                      <X size={10} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-red-600 leading-tight">
                      {errorMsg}
                    </p>
                  </motion.div>
                )}

                <button 
                  disabled={status === 'loading'}
                  className="w-full py-5 bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 mt-4 active:scale-95 transition-all flex items-center justify-center"
                >
                  {status === 'loading' ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    'TASDIQLASH'
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center font-medium px-4 leading-relaxed">
                  Tasdiqlash tugmasini bossangiz, almazlaringiz hisobingizdan yechiladi va so'rov yuboriladi.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
