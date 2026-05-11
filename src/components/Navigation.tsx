import React from 'react';
import { Home, Compass, Users } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-50">
      <button 
        onClick={() => setActiveTab('tasks')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-medium">Asosiy</span>
      </button>
      <button 
        onClick={() => setActiveTab('wheel')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'wheel' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <Compass size={24} />
        <span className="text-[10px] font-medium">Charxpalak</span>
      </button>
      <button 
        onClick={() => setActiveTab('referrals')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'referrals' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <Users size={24} />
        <span className="text-[10px] font-medium">Do'stlar</span>
      </button>
    </div>
  );
};
