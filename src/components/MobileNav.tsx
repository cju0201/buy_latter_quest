import React from 'react';
import { ActiveTab } from '../types/quest';
import { Shield, BookOpen, Trophy, ScrollText, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  reviewCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
}) => {
  const handleClick = (tab: ActiveTab) => {
    soundManager.playBlip();
    setActiveTab(tab);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#211A36]/95 backdrop-blur-lg border-t-2 border-[#45356e] px-1 py-1.5 safe-bottom">
      <div className="grid grid-cols-5 gap-0.5">
        <button
          type="button"
          onClick={() => handleClick('lobby')}
          className={`flex flex-col items-center justify-center py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'lobby'
              ? 'text-[#F6D778] font-bold'
              : 'text-[#F4D9F0]/70 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-retro">冒險大廳</span>
        </button>

        <button
          type="button"
          onClick={() => handleClick('codex')}
          className={`relative flex flex-col items-center justify-center py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'codex'
              ? 'text-[#F6D778] font-bold'
              : 'text-[#F4D9F0]/70 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-retro">任務圖鑑</span>
          {reviewCount > 0 && (
            <span className="absolute -top-0.5 right-1.5 bg-[#F6D778] text-[#211A36] font-pixel text-[8px] px-1 rounded-full font-bold">
              {reviewCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleClick('relics')}
          className={`flex flex-col items-center justify-center py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'relics'
              ? 'text-[#F6D778] font-bold'
              : 'text-[#F4D9F0]/70 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-retro">聖物圖鑑</span>
        </button>

        <button
          type="button"
          onClick={() => handleClick('achievements')}
          className={`flex flex-col items-center justify-center py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'achievements'
              ? 'text-[#F6D778] font-bold'
              : 'text-[#F4D9F0]/70 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-retro">成就室</span>
        </button>

        <button
          type="button"
          onClick={() => handleClick('chronicle')}
          className={`flex flex-col items-center justify-center py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'chronicle'
              ? 'text-[#F6D778] font-bold'
              : 'text-[#F4D9F0]/70 hover:text-white'
          }`}
        >
          <ScrollText className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-retro">冒險紀錄</span>
        </button>
      </div>
    </div>
  );
};
