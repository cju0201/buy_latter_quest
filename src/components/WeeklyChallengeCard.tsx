import React, { useState } from 'react';
import { WeeklyChallengeWeekData, WeeklyChallengeInstance } from '../types/quest';
import { getTaiwanWeekInfo, CHALLENGE_TEMPLATES } from '../utils/challenge';
import { Target, CheckCircle2, Award, Calendar, Sparkles, ChevronRight, CheckSquare, Square, Info } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface WeeklyChallengeCardProps {
  weekData: WeeklyChallengeWeekData;
  onClaimReward: (challengeId: string) => void;
  onManualSelfCheck: (challengeId: string) => void;
  onClaimAllBonus: () => void;
}

export const WeeklyChallengeCard: React.FC<WeeklyChallengeCardProps> = ({
  weekData,
  onClaimReward,
  onManualSelfCheck,
  onClaimAllBonus,
}) => {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const weekInfo = getTaiwanWeekInfo();

  const completedCount = weekData.challenges.filter((c) => c.isCompleted).length;
  const allCompleted = completedCount === weekData.challenges.length;

  return (
    <div className="p-4 sm:p-5 rounded-lg pixel-box bg-[#30254D] border-2 border-[#5a4687] space-y-4">
      {/* Title & Week Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4d3a77] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#4a3575] border border-[#F6D778] flex items-center justify-center text-[#F6D778]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-retro font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>本週消費挑戰 · Weekly Quests</span>
              <span className="font-mono text-xs text-[#F6D778] font-normal">
                ({completedCount} / {weekData.challenges.length})
              </span>
            </h3>
            <p className="text-[11px] text-[#F4D9F0]/70 font-retro flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-[#8B65C7]" />
              <span>台灣時間 {weekInfo.formattedRange}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllTemplates(!showAllTemplates)}
          className="text-xs text-[#F4D9F0]/80 hover:text-[#F6D778] font-retro flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#F6D778]" />
          <span>查看所有 10 項挑戰</span>
        </button>
      </div>

      {/* 3 Active Weekly Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {weekData.challenges.map((challenge) => {
          const isSelfCheck = challenge.verificationType === 'self_reflection';

          return (
            <div
              key={challenge.id}
              className={`p-3.5 rounded-lg flex flex-col justify-between transition-all ${
                challenge.isClaimed
                  ? 'pixel-box bg-[#221a36] border border-[#3f305c] opacity-80'
                  : challenge.isCompleted
                  ? 'pixel-box-gold bg-[#3d2e61] border-2 border-[#F6D778]'
                  : 'pixel-box bg-[#281e42] border border-[#4d3c73]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <h4 className="font-retro font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {challenge.title}
                  </h4>
                  <span className="font-pixel text-[10px] text-[#F6D778] font-bold shrink-0">
                    +{challenge.rewardExp} EXP
                  </span>
                </div>

                <p className="text-[11px] text-[#F4D9F0]/80 font-sans leading-relaxed mb-2">
                  {challenge.description}
                </p>
              </div>

              {/* Action Area */}
              <div className="pt-2 border-t border-white/10 mt-auto flex items-center justify-between gap-2">
                {challenge.isClaimed ? (
                  <span className="text-[11px] text-[#6ee7b7] font-retro flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已領取獎勵
                  </span>
                ) : challenge.isCompleted ? (
                  <button
                    type="button"
                    disabled={claimingId === challenge.id || challenge.isClaimed}
                    onClick={() => {
                      if (claimingId === challenge.id || challenge.isClaimed) return;
                      setClaimingId(challenge.id);
                      soundManager.playCoin();
                      onClaimReward(challenge.id);
                      setTimeout(() => setClaimingId(null), 1000);
                    }}
                    className={`w-full pixel-btn bg-[#F6D778] hover:bg-[#ffe38f] text-[#211A36] font-bold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      claimingId === challenge.id ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-[#211A36]" />
                    <span>{claimingId === challenge.id ? '領取中...' : `領取 +${challenge.rewardExp} EXP`}</span>
                  </button>
                ) : isSelfCheck ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playBlip();
                      onManualSelfCheck(challenge.id);
                    }}
                    className="w-full text-left text-[11px] font-retro text-[#F4D9F0]/80 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded bg-[#332554] hover:bg-[#3f2e66] border border-[#5d468a] cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-[#F6D778]" />
                    <span>自行勾選完成實踐</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-[#F4D9F0]/60 font-retro flex items-center gap-1">
                    <span>進行中：{challenge.actionHint}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Complete Weekly Bonus Card */}
      {allCompleted && (
        <div className="p-3 bg-[#382b57] rounded border-2 border-[#F6D778] flex items-center justify-between gap-3 font-retro">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6D778] animate-spin" />
            <div>
              <span className="text-xs font-bold text-[#F6D778]">
                🎉 本週全挑戰大滿貫！
              </span>
              <p className="text-[10px] text-[#F4D9F0]/80">
                本週 3 項挑戰已全數達成，領取週全勤額外榮譽獎勵
              </p>
            </div>
          </div>

          {weekData.hasClaimedWeeklyBonus ? (
            <span className="text-xs text-[#6ee7b7] font-bold shrink-0">
              已領取週大獎
            </span>
          ) : (
            <button
              type="button"
              disabled={isClaimingBonus || weekData.hasClaimedWeeklyBonus}
              onClick={() => {
                if (isClaimingBonus || weekData.hasClaimedWeeklyBonus) return;
                setIsClaimingBonus(true);
                soundManager.playLevelUp();
                onClaimAllBonus();
                setTimeout(() => setIsClaimingBonus(false), 1000);
              }}
              className={`pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white font-bold text-xs px-3 py-1.5 rounded cursor-pointer shrink-0 transition-all ${
                isClaimingBonus ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isClaimingBonus ? '領取中...' : '領取全勤 +50 EXP'}
            </button>
          )}
        </div>
      )}

      {/* Modal: All 10 Challenge Templates */}
      {showAllTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#30254D] border-2 border-[#8B65C7] rounded-lg pixel-box shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-retro">
            <div className="px-5 py-3.5 bg-[#251b3d] border-b border-[#4d3a77] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#F6D778]" />
                <h3 className="font-bold text-sm text-white">
                  公會每週挑戰全目錄（共 10 項題庫）
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTemplates(false)}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5">
              <p className="text-xs text-[#F4D9F0]/80 leading-relaxed font-sans mb-2">
                系統每週一 00:00（台灣時間）會自動從以下 10 項題庫中抽取 3 項作為當週挑戰，跨週自動更新並保留歷史完成紀錄。
              </p>

              {CHALLENGE_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="p-3 bg-[#241a3b] rounded border border-[#48376f] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span aria-hidden="true" className="text-base leading-none">{tmpl.emoji}</span>
                      <span>{tmpl.title}</span>
                    </span>
                    <span className="font-pixel text-[10px] text-[#F6D778]">
                      +{tmpl.rewardExp} EXP
                    </span>
                  </div>
                  <p className="text-[11px] text-[#F4D9F0]/70 font-sans">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-5 py-2.5 bg-[#251b3d] border-t border-[#4d3a77] text-right">
              <button
                type="button"
                onClick={() => setShowAllTemplates(false)}
                className="pixel-btn bg-[#8B65C7] text-white px-4 py-1.5 text-xs rounded"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
