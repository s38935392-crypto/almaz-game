import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kyqudwhiwrrsfcpxjyef.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0UmVmIjoia3lxdWR3aGl3cnJzZmNweGp5ZWYiLCJpYXQiOjE3NDcwNzE4NDMsImV4cCI6MjA2MjY0Nzg0M30.eyJpZCI6ImJmYmZzZzI3LWJmYmYtNGJmZi04YmZmLWJmYmZzZzI3YmZiZiIsInJvbGUiOiJhbm9uIn0');

interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: 'subscription' | 'daily' | 'referral';
}

interface User {
  telegram_id: number;
  username: string;
  balance: number;
}

interface AppContextType {
  user: User | null;
  tasks: Task[];
  updateDiamonds: (amount: number) => Promise<void>;
  spinWheel: () => number;
  supabase: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const tg = (window as any).Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  useEffect(() => {
    const loadUser = async () => {
      if (tgUser) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', tgUser.id)
          .single();
        
        if (data) {
          setUser(data);
        }
      }
    };
    loadUser();
  }, [tgUser]);

  const updateDiamonds = async (amount: number) => {
    if (!user) return;
    const newBalance = user.balance + amount;
    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('telegram_id', user.telegram_id);

    if (!error) {
      setUser({ ...user, balance: newBalance });
    }
  };

  const spinWheel = () => {
    const prizes = [10, 5, 7, 0, -10, 7, 5, 10];
    return prizes[Math.floor(Math.random() * prizes.length)];
  };

  const tasks: Task[] = [
    { id: '1', title: 'Kanalga obuna bo\'ling', reward: 5, completed: false, type: 'subscription' },
    { id: '2', title: 'Do\'stlarni taklif qiling', reward: 5, completed: false, type: 'referral' },
  ];

  return (
    <AppContext.Provider value={{ user, tasks, updateDiamonds, spinWheel, supabase }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
