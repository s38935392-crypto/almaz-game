/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TasksView } from './views/TasksView';
import { WheelView } from './views/WheelView';
import { ReferralsView } from './views/ReferralsView';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks');

  const renderView = () => {
    switch (activeTab) {
      case 'tasks': return <TasksView />;
      case 'wheel': return <WheelView />;
      case 'referrals': return <ReferralsView />;
      default: return <TasksView />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans select-none overflow-x-hidden">
        <Header />
        
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </AppProvider>
  );
}
