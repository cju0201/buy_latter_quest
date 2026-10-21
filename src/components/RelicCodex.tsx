import React, { useState } from 'react';
import { RelicItem } from '../types/quest';
import { Lock, Sparkles, CheckCircle, Info, X } from 'lucide-react';
import { formatDateTime } from '../utils/time';
import { soundManager } from '../utils/sound';

interface RelicCodexProps {
  relics: RelicItem[];
}

export const RelicCodex: React.FC<RelicCodexProps> = ({ relics }) => {
  const [selectedRelic, setSelectedRelic] = useState<RelicItem | null>(null);

  const unlockedCount = relics.filter((r) => r.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / relics.length) * 100);

  const handleCardClick = (relic: RelicItem) => {
    soundManager.playBlip();
    setSelectedRelic(relic);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg pixel-box bg-[#30254D]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#412e69] border-2 border-[#F6D778] flex items-center justify-center text-2xl shadow-md">
            💎
          </div>
          <div>
            <h2 className="text-xl font-bold font-retro text-white">
              冒險者圖鑑 · 像素聖物收藏庫
            </h2>
            <p className="text-xs text-[#F4D9F0]/70 font-retro mt-0.5">
              蒐集散落於自律修煉中的珍稀聖物，見證理性冒險者的榮耀徽記
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-retro text-[#F4D9F0]/70">
            聖物收集率
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#F6D778] tabular-nums">
            {unlockedCount} / {relics.length}{' '}
            <span className="text-xs text-[#F4D9F0]/60">({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 py-3.5 bg-[#251a3d] border border-[#48376f] rounded-lg">
        <div className="flex items-center justify-between text-xs font-retro mb-1.5">
          <span className="text-[#F4D9F0]/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F6D778]" />
            圖鑑完整度
          </span>
          <span className="font-mono text-[#F6D778] font-bold">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#150d24] rounded-xs overflow-hidden border border-[#524177]">
          <div
            className="h-full bg-gradient-to-r from-[#8B65C7] to-[#F6D778] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Relic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {relics.map((relic) => {
          return (
            <button
              key={relic.id}
              type="button"
              onClick={() => handleCardClick(relic)}
              className={`p-4 rounded-lg flex flex-col items-center text-center transition-all cursor-pointer group text-left ${
                relic.isUnlocked
                  ? 'pixel-box-gold bg-[#342754] border-2 border-[#F6D778] hover:scale-102 hover:shadow-lg'
                  : 'pixel-box bg-[#221838] opacity-70 border border-[#453469] hover:opacity-90'
              }`}
            >
              {/* Relic Icon Box */}
              <div className={`w-14 h-14 rounded-md flex items-center justify-center text-3xl mb-3 relative transition-all ${
                relic.isUnlocked
                  ? 'bg-[#432e6e] border border-[#F6D778]/70 shadow-inner'
                  : 'bg-[#181129] border border-white/10 grayscale'
              }`}>
                {relic.isUnlocked ? (
                  <span>{relic.iconSvg}</span>
                ) : (
                  <div className="relative">
                    <span className="opacity-20 blur-[1px]">{relic.iconSvg}</span>
                    <Lock className="w-5 h-5 text-white/50 absolute inset-0 m-auto" />
                  </div>
                )}

                {relic.isUnlocked && (
                  <div className="absolute -top-1.5 -right-1.5 bg-[#F6D778] text-[#211A36] rounded-full p-0.5 shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Title & Tag */}
              <h3 className={`font-retro font-bold text-xs sm:text-sm mb-1 ${
                relic.isUnlocked ? 'text-[#F6D778]' : 'text-white/60'
              }`}>
                {relic.isUnlocked ? relic.name : '？？？'}
              </h3>

              <span className={`text-[10px] font-retro px-2 py-0.5 rounded ${
                relic.isUnlocked
                  ? 'bg-[#48336d] text-[#F6D778]'
                  : 'bg-[#1a122b] text-white/40'
              }`}>
                {relic.isUnlocked ? '已典藏' : '未發現'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item Detail / Lore Inspection Modal */}
      {selectedRelic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`relative w-full max-w-sm rounded-lg p-5 overflow-hidden shadow-2xl font-retro ${
            selectedRelic.isUnlocked
              ? 'pixel-box-gold bg-[#30254D] border-2 border-[#F6D778]'
              : 'pixel-box bg-[#241a3b] border-2 border-[#524177]'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs text-[#F6D778] font-bold">
                【聖物鑑定圖錄】
              </span>
              <button
                type="button"
                onClick={() => setSelectedRelic(null)}
                className="text-[#F4D9F0]/60 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-4xl mb-2.5 ${
                selectedRelic.isUnlocked
                  ? 'bg-[#453070] border-2 border-[#F6D778]'
                  : 'bg-[#181129] border border-white/20'
              }`}>
                {selectedRelic.isUnlocked ? (
                  <span>{selectedRelic.iconSvg}</span>
                ) : (
                  <Lock className="w-7 h-7 text-white/50" />
                )}
              </div>

              <h4 className="font-bold text-base text-white">
                {selectedRelic.isUnlocked ? selectedRelic.name : `${selectedRelic.name} (未解鎖)`}
              </h4>

              <div className="mt-1">
                <span className="text-[11px] font-pixel text-[#F6D778]">
                  獎勵：+{selectedRelic.rewardExp} EXP
                </span>
              </div>
            </div>

            {/* Description / Lore */}
            <div className="bg-[#1c1330] p-3 rounded border border-white/10 text-xs text-[#F4D9F0]/90 leading-relaxed font-sans mb-3">
              <p className="italic">
                {selectedRelic.description}
              </p>
            </div>

            {/* Unlock Condition */}
            <div className="bg-[#2a1d47] p-2.5 rounded border border-[#6b559b]/50 text-xs text-[#F4D9F0] mb-4">
              <div className="flex items-center gap-1.5 text-[#F6D778] font-bold mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>解鎖條件：</span>
              </div>
              <p className="text-[11px] text-[#F4D9F0]/80">
                {selectedRelic.unlockCondition}
              </p>
              {selectedRelic.unlockedAt && (
                <div className="text-[10px] text-[#6ee7b7] font-mono mt-1.5 pt-1 border-t border-white/10">
                  達成於 {formatDateTime(selectedRelic.unlockedAt)}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedRelic(null)}
              className="w-full pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white py-2 text-xs font-bold rounded cursor-pointer"
            >
              關閉圖錄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
