import React from 'react';
import { useApp } from '../context/AppContext';
import { Diamond, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const TasksView: React.FC = () => {
  const { tasks, completeTask } = useApp();

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
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
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
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                {task.type === 'subscription' ? (
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                     <span className="text-[10px] text-white font-bold leading-none text-center">STAGE GIFT</span>
                  </div>
                ) : (
                  <Diamond size={24} className="fill-blue-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{task.title}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-gray-900">{task.reward}</span>
                  <Diamond size={12} className="text-blue-500 fill-blue-500" />
                  <span className="text-[10px] text-gray-400 font-medium ml-1">obuna uchun</span>
                </div>
              </div>
            </div>
            
            <button 
              disabled={task.completed}
              onClick={() => completeTask(task.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                task.completed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-1' 
                : 'bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
              }`}
            >
              {task.completed ? (
                <>
                  <CheckCircle2 size={14} />
                  Bajarildi
                </>
              ) : 'Obuna bo\'lish'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
