import React from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink } from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, updateDiamonds } = useApp();

  const handleComplete = async (reward: number) => {
    window.open('https://t.me/FreeFireTopSavdolar', '_blank');
    await updateDiamonds(reward);
  };

  return (
    <div className="px-4 py-6 space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between">
          <div>
            <p className="font-bold">{task.title}</p>
            <p className="text-blue-500">+{task.reward} 💎</p>
          </div>
          <button onClick={() => handleComplete(task.reward)} className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ExternalLink size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};
