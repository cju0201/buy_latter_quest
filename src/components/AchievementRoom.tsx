import React from 'react';
import { Achievement } from '../types/quest';
import { Trophy, CheckCircle, Lock } from 'lucide-react';
import { formatDateTime } from '../utils/time';

interface AchievementRoomProps {
  achievements: Achievement[];
  totalExp: number;
}

export const AchievementRoom: React.FC<AchievementRoomProps> = ({
  achievements,
  totalExp,
}) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const percentComplete = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg pixel-box bg-[#30254D]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#3d2c61] border border-[#F6D778] flex items-center justify-center text-2xl shadow-md">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-bold font-retro text-white">
              榮耀成就室 · Hall of Trophies
            </h2>
            <p className="text-xs text-[#F4D9F0]/70 font-retro mt-0.5">
              紀錄你一次次抵擋消費衝動、修煉自律意志的輝煌里程碑
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-retro text-[#F4D9F0]/70">
            成就達成率
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#F6D778] tabular-nums">
            {unlockedCount} / {achievements.length}{' '}
            <span className="text-xs text-[#F4D9F0]/60">({percentComplete}%)</span>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.round((ach.progress / ach.maxProgress) * 100))
          );

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-lg flex flex-col justify-between transition-all ${
                ach.isUnlocked
                  ? 'pixel-box-gold bg-[#342754] border-2 border-[#F6D778]'
                  : 'pixel-box bg-[#271f3d] opacity-75 border border-[#48376f]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded bg-[#1e162f] border border-[#524177] flex items-center justify-center text-xl shrink-0">
                    {ach.icon}
                  </div>
                  <div>
                    {ach.isUnlocked ? (
                      <span className="text-[11px] font-retro text-[#F6D778] font-bold flex items-center gap-1 bg-[#47346b] px-2 py-0.5 rounded border border-[#F6D778]/50">
                        <CheckCircle className="w-3 h-3 text-[#F6D778]" />
                        已解鎖
                      </span>
                    ) : (
                      <span className="text-[11px] font-retro text-[#F4D9F0]/50 flex items-center gap-1 bg-[#1c142e] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        未解鎖
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`font-retro font-bold text-sm mb-1 ${ach.isUnlocked ? 'text-[#F6D778]' : 'text-white'}`}>
                  {ach.title}
                </h3>
                <p className="text-xs text-[#F4D9F0]/80 leading-relaxed font-retro">
                  {ach.description}
                </p>
              </div>

              {/* Progress & Reward */}
              <div className="mt-4 pt-3 border-t border-[#46356d]">
                <div className="flex items-center justify-between text-[11px] font-retro text-[#F4D9F0]/70 mb-1">
                  <span>進度</span>
                  <span className="font-mono tabular-nums">
                    {ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#1b122e] rounded-xs overflow-hidden border border-[#524177]">
                  <div
                    className={`h-full rounded-xs transition-all duration-500 ${
                      ach.isUnlocked ? 'bg-[#F6D778]' : 'bg-[#8B65C7]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#F4D9F0]/50 mt-2 font-retro">
                  <span>獎勵：+{ach.rewardExp} EXP</span>
                  {ach.unlockedAt && (
                    <span>達成於 {formatDateTime(ach.unlockedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
