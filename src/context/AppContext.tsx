import React, { createContext, useContext, useState, useEffect } from 'react';
 
interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: 'subscription' | 'daily' | 'referral';
  channelUrl?: string;
}
 
interface Referral {
  id: string;
  name: string;
  joinedAt: number;
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
  referrals: Referral[];
  completeTask: (taskId: string) => void;
  updateDiamonds: (amount: number) => void;
  spinWheel: () => number;
  onlineCount: number;
  addReferral: (name: string) => void;
  getDailyBonusTimeLeft: () => number; // seconds left, 0 = can claim
  claimDailyBonus: () => boolean;
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
      tg.expand();
    }
  }, []);
 
  // Tasks - subscription task with channel URL
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks_data');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        title: 'Kanalga obuna bo\'lish',
        reward: 5,
        completed: false,
        type: 'subscription',
        channelUrl: 'https://t.me/FreeFireTopSavdolar',
      },
      {
        id: '2',
        title: 'Do\'stlarga tarqatish',
        reward: 5,
        completed: false,
        type: 'referral',
      },
      {
        id: '3',
        title: 'Kunlik bonus',
        reward: 2,
        completed: false,
        type: 'daily',
      },
    ];
  });
 
  // Referrals list
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('referrals_data');
    if (saved) return JSON.parse(saved);
    return [];
  });
 
  // Daily bonus last claimed timestamp
  const [dailyBonusLastClaimed, setDailyBonusLastClaimed] = useState<number>(() => {
    const saved = localStorage.getItem('daily_bonus_last');
    return saved ? parseInt(saved) : 0;
  });
 
  // Subscription bonus claimed flag (permanent, never reset)
  const [subscriptionClaimed, setSubscriptionClaimed] = useState<boolean>(() => {
    return localStorage.getItem('subscription_claimed') === 'true';
  });
 
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
 
  useEffect(() => {
    localStorage.setItem('tasks_data', JSON.stringify(tasks));
  }, [tasks]);
 
  useEffect(() => {
    localStorage.setItem('referrals_data', JSON.stringify(referrals));
  }, [referrals]);
 
  // Returns seconds left until next daily bonus (0 = can claim now)
  const getDailyBonusTimeLeft = (): number => {
    if (dailyBonusLastClaimed === 0) return 0;
    const elapsed = (Date.now() - dailyBonusLastClaimed) / 1000;
    const remaining = 24 * 3600 - elapsed;
    return remaining > 0 ? Math.floor(remaining) : 0;
  };
 
  const claimDailyBonus = (): boolean => {
    if (getDailyBonusTimeLeft() > 0) return false;
    const now = Date.now();
    setDailyBonusLastClaimed(now);
    localStorage.setItem('daily_bonus_last', now.toString());
    updateDiamonds(2);
    return true;
  };
 
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
 
    if (task.type === 'subscription') {
      // Subscription bonus: only once ever
      if (subscriptionClaimed) return;
      // Open Telegram channel
      window.open(task.channelUrl, '_blank');
      // Mark as claimed permanently
      setSubscriptionClaimed(true);
      localStorage.setItem('subscription_claimed', 'true');
      updateDiamonds(task.reward);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    } else if (task.type === 'daily') {
      const claimed = claimDailyBonus();
      if (claimed) {
        // Don't permanently complete daily - reset after 24h
      }
    } else if (task.type === 'referral') {
      // Referral task handled by share button in ReferralsView
    }
  };
 
  const updateDiamonds = (amount: number) => {
    setUser(prev => ({
      ...prev,
      diamonds: Math.max(0, prev.diamonds + amount),
      totalWon: amount > 0 ? (prev.totalWon || 0) + amount : (prev.totalWon || 0)
    }));
  };
 
  const addReferral = (name: string) => {
    const newRef: Referral = {
      id: Date.now().toString(),
      name,
      joinedAt: Date.now(),
    };
    setReferrals(prev => {
      const updated = [...prev, newRef];
      localStorage.setItem('referrals_data', JSON.stringify(updated));
      return updated;
    });
    updateDiamonds(5);
  };
 
  const spinWheel = () => {
    const prizes = [10, 5, 7, 0, -10, 7, 5, 10];
    const isHardMode = user.diamonds >= 60;
 
    let result: number;
    if (isHardMode) {
      const random = Math.random() * 100;
      if (random < 5) {
        const winPrizes = [10, 5, 7];
        result = winPrizes[Math.floor(Math.random() * winPrizes.length)];
      } else {
        const losePrizes = [0, -10];
        result = losePrizes[Math.floor(Math.random() * losePrizes.length)];
      }
    } else {
      result = prizes[Math.floor(Math.random() * prizes.length)];
    }
 
    updateDiamonds(-2);
    return result;
  };
 
  return (
    <AppContext.Provider value={{
      user, tasks, referrals, completeTask, updateDiamonds, spinWheel,
      onlineCount, addReferral, getDailyBonusTimeLeft, claimDailyBonus
    }}>
      {children}
    </AppContext.Provider>
  );
};
 
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
