import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, Crown, AlertCircle } from 'lucide-react';
import { WithdrawModal } from './WithdrawModal';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { user, onlineCount } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleWithdrawClick = () => {
    if (user.diamonds < 100) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-40 border-b border-gray-50">
        <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
             <Crown size={14} className="text-yellow-500 fill-yellow-500" />
             <span className="text-xs font-bold text-gray-800">7</span>
             <span className="text-xs font-bold text-gray-800 tracking-tight">{user.firstName} {user.lastName}</span>
             <Crown size={14} className="text-yellow-500 fill-yellow-500" />
          </div>
          <span className="text-[10px] text-gray-400">Online: {onlineCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-100">
          <Diamond size={14} className="text-blue-500 fill-blue-500" />
          <span className="font-bold text-gray-700">{user.diamonds}</span>
        </div>
        <button 
          onClick={handleWithdrawClick}
          className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
        >
          Chiqarish
        </button>
      </div>
    </div>

    {/* Error Message Overlay */}
      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <AlertCircle size={24} />
              <p className="text-xs font-black uppercase">
                Hisobingizda Almaz yetarli emas! <br />
                <span className="opacity-80">Minimal yechish 100 Almaz</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WithdrawModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
