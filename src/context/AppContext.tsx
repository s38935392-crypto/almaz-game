import React, { createContext, useContext, useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: 'subscription' | 'other';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  diamonds: number;
  referralCode: string;
  totalWon: number;
}

interface AppContextType {
  user: User;
  tasks: Task[];
  completeTask: (taskId: string) => void;
  updateDiamonds: (amount: number) => void;
  spinWheel: () => number;
  onlineCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

declare global {
  interface Window {
    Telegram: any;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('user_data');
    
    // Telegramdan ma'lumot olish
    const tg = window.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser) {
      return {
        id: tgUser.id.toString(),
        firstName: tgUser.first_name || 'Foydalanuvchi',
        lastName: tgUser.last_name || '',
        username: tgUser.username || 'user',
        diamonds: saved ? JSON.parse(saved).diamonds : 10,
        referralCode: 'REF' + tgUser.id,
        totalWon: saved ? JSON.parse(saved).totalWon : 0,
      };
    }

    if (saved) return JSON.parse(saved);
    return {
      id: '1',
      firstName: 'Mehmon',
      lastName: '',
      username: 'guest',
      diamonds: 10,
      referralCode: 'REF' + Math.floor(Math.random() * 100000),
      totalWon: 0,
    };
  });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Ilovani to'liq ekranga yoyish
    }
  }, []);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Kanalga obuna bo\'lish', reward: 5, completed: false, type: 'subscription' },
    { id: '2', title: 'Do\'stlarni taklif qilish', reward: 5, completed: false, type: 'other' },
    { id: '3', title: 'Kunlik bonus', reward: 2, completed: false, type: 'other' },
  ]);

  const [onlineCount, setOnlineCount] = useState(132);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(100, prev + diff);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('user_data', JSON.stringify(user));
  }, [user]);

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && !t.completed) {
        updateDiamonds(t.reward);
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  const updateDiamonds = (amount: number) => {
    setUser(prev => ({
      ...prev,
      diamonds: prev.diamonds + amount,
      totalWon: amount > 0 ? (prev.totalWon || 0) + amount : (prev.totalWon || 0)
    }));
  };

  const spinWheel = () => {
    const prizes = [10, 5, 7, 0, -10];
    const isHardMode = user.diamonds >= 60; // User collected 60 diamonds
    
    let result: number;
    if (isHardMode) {
      // 5% winning chance (10, 5, 7)
      const random = Math.random() * 100;
      if (random < 5) {
        // Win one of the positive prizes
        const winPrizes = [10, 5, 7];
        result = winPrizes[Math.floor(Math.random() * winPrizes.length)];
      } else {
        // Lose or get 0
        const losePrizes = [0, -10];
        result = losePrizes[Math.floor(Math.random() * losePrizes.length)];
      }
    } else {
      // Normal mode: equal chance for simplicity or customized
      result = prizes[Math.floor(Math.random() * prizes.length)];
    }

    updateDiamonds(-2); // Cost 2 to spin is deducted immediately
    return result;
  };

  return (
    <AppContext.Provider value={{ user, tasks, completeTask, updateDiamonds, spinWheel, onlineCount }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
