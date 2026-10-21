import React from 'react';
import { ActiveTab } from '../types/quest';
import { Volume2, VolumeX, Sparkles, CircleHelp } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { BgmPlayer } from './BgmPlayer';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewQuest?: () => void;
  onOpenSoulQuiz?: () => void;
  reviewCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  soundEnabled,
  onToggleSound,
  onOpenTour,
}) => {
  const handleNavClick = (tab: ActiveTab) => {
    soundManager.playBlip();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#211A36]/95 backdrop-blur-md border-b-2 border-[#45356e] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('lobby')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-sm bg-[#8B65C7] flex items-center justify-center pixel-box text-white text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-[#F6D778]" />
            </div>
            <div className="flex flex-col">
              <span className="font-pixel text-xs sm:text-sm tracking-wider text-white font-bold whitespace-nowrap">
                BUY LATER QUEST
              </span>
              <span className="text-[11px] text-[#F4D9F0]/70 font-retro whitespace-nowrap">
                購物冷靜期・心動冒險公會
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium font-retro">
          <button
            type="button"
            onClick={() => handleNavClick('lobby')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'lobby'
                ? 'border-[#F6D778] text-[#F6D778] font-bold'
                : 'border-transparent text-[#F4D9F0]/80 hover:text-white'
            }`}
          >
            冒險大廳
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('codex')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'codex'
                ? 'border-[#F6D778] text-[#F6D778] font-bold'
                : 'border-transparent text-[#F4D9F0]/80 hover:text-white'
            }`}
          >
            <span>任務圖鑑</span>
            {reviewCount > 0 && (
              <span className="bg-[#F6D778] text-[#211A36] font-pixel text-[10px] px-1.5 py-0.2 rounded font-bold">
                {reviewCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('relics')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'relics'
                ? 'border-[#F6D778] text-[#F6D778] font-bold'
                : 'border-transparent text-[#F4D9F0]/80 hover:text-white'
            }`}
          >
            冒險者圖鑑
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('achievements')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-[#F6D778] text-[#F6D778] font-bold'
                : 'border-transparent text-[#F4D9F0]/80 hover:text-white'
            }`}
          >
            成就室
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('chronicle')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'chronicle'
                ? 'border-[#F6D778] text-[#F6D778] font-bold'
                : 'border-transparent text-[#F4D9F0]/80 hover:text-white'
            }`}
          >
            冒險紀錄
          </button>
        </nav>

        {/* Zone 3: BGM Player + Sound Toggle + Soul Quiz + Accept Quest */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTour}
            aria-label="開啟功能導覽"
            title="功能導覽"
            className="p-2 rounded border border-[#524177] bg-[#30254D] text-[#F4D9F0]/80 hover:text-white hover:bg-[#3b2e5e] transition-colors cursor-pointer"
          >
            <CircleHelp className="w-4 h-4 text-[#F6D778]" />
          </button>
          {/* BGM Controller */}
          <BgmPlayer />

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? '音效已開啟' : '音效已靜音'}
            aria-label="切換8-bit遊戲音效"
            className="p-2 rounded border border-[#524177] bg-[#30254D] text-[#F4D9F0]/80 hover:text-white hover:bg-[#3b2e5e] transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#F6D778]" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
