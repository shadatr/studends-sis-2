'use client';
// import { TabType } from '@/app/types/types';
import React, { useState } from 'react';


const Tabs = () => {
  const [activeTab, setActiveTab] = useState<string>('Tab 1');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div>
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={activeTab === 'Tab 1' ? 'active' : ''}
        >
          Tab 1
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={activeTab === 'Tab 2' ? 'active' : ''}
        >
          Tab 2
        </button>
        
      </div>
      <div>
        {activeTab === 'Tab 1' && <div>Content for Tab 1</div>}
        {activeTab === 'Tab 2' && <div> </div>}
      </div>
    </div>
  );
};

export default Tabs;

