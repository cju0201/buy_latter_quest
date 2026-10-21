import React, { useState } from 'react';
import { BudgetMode, QuestItem } from '../types/quest';
import { getCategoryMeta } from '../utils/category';
import { formatDateTime } from '../utils/time';
import { X, ShieldAlert, Clock, ShoppingCart, Sparkles, ExternalLink, Brain, Calendar, CalendarPlus, Download } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { openGoogleCalendar, downloadIcsFile } from '../utils/calendar';
import { getBudgetEquivalent } from '../utils/budget';

interface DecisionModalProps {
  quest: QuestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecision: (
    questId: string,
    decision: 'abandoned' | 'purchased' | 'extended',
    options?: { extendHours?: number; userReflection?: string }
  ) => void;
  onOpenSoulQuiz?: (quest: QuestItem) => void;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  quest,
  isOpen,
  onClose,
  onConfirmDecision,
  onOpenSoulQuiz,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
}) => {
  const [selectedExtendHours, setSelectedExtendHours] = useState<number>(72);
  const [reflection, setReflection] = useState('');
  const [activeStep, setActiveStep] = useState<'options' | 'extendSelect'>('options');

  if (!isOpen || !quest) return null;

  const categoryMeta = getCategoryMeta(quest.category);
  const budgetEquivalent = getBudgetEquivalent(quest.price, budgetMode, wagePerHour, monthlyAllowance);

  const handleAbandon = () => {
    soundManager.playAbandon();
    onConfirmDecision(quest.id, 'abandoned', { userReflection: reflection.trim() });
    onClose();
  };

  const handlePurchase = () => {
    soundManager.playPurchased();
    onConfirmDecision(quest.id, 'purchased', { userReflection: reflection.trim() });
    onClose();
  };

  const handleExtend = () => {
    soundManager.playBlip();
    onConfirmDecision(quest.id, 'extended', {
      extendHours: selectedExtendHours,
      userReflection: reflection.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#30254D] border-2 border-[#F6D778] rounded-lg pixel-box-gold shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#251b3d] border-b border-[#4d3a77] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6D778]" />
            <h2 className="font-retro font-bold text-base sm:text-lg text-[#F6D778]">
              【冒險決策時光】心動回顧評估
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#F4D9F0]/60 hover:text-white p-1 rounded hover:bg-[#382a5c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Inspection Card */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-4 bg-[#211a36] rounded-md border border-[#4d3a77] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#F4D9F0]/70 font-retro">
              <span>{categoryMeta.emoji} {categoryMeta.label}</span>
              <span>任務建立於 {formatDateTime(quest.createdAt)}</span>
            </div>

            <h3 className="text-lg font-bold text-white font-retro">
              {quest.name}
            </h3>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xl font-mono font-bold text-[#F6D778]">
                NT$ {quest.price.toLocaleString()}
              </span>
              {budgetEquivalent && (
                <span className="text-xs text-[#F4D9F0]/70 font-retro">
                  {budgetEquivalent}
                </span>
              )}
            </div>

            {quest.note && (
              <div className="mt-2 pt-2 border-t border-[#38295a] text-xs text-[#F4D9F0]/90">
                <span className="text-[#F6D778] font-bold">當初的心動原因：</span>
                <p className="mt-0.5 italic">{quest.note}</p>
              </div>
            )}

            {quest.url && (
              <a
                href={quest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#a481de] hover:text-[#F6D778] flex items-center gap-1 underline"
              >
                <span>重新瀏覽商品連結確認</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Calendar Integration in DecisionModal */}
            <div className="mt-2.5 pt-2 border-t border-[#38295a]">
              <div className="flex items-center justify-between text-[11px] text-[#F4D9F0]/80 mb-1.5 font-retro">
                <span className="flex items-center gap-1 text-[#F6D778] font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#F6D778]" />
                  <span>加入行事曆提醒</span>
                </span>
                <span className="text-[10px] text-[#F4D9F0]/60 font-mono">
                  截止時間：{formatDateTime(quest.deadline)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playBlip();
                    openGoogleCalendar(quest, wagePerHour, budgetMode, monthlyAllowance);
                  }}
                  className="pixel-btn bg-[#2b2149] hover:bg-[#3d2f63] text-white hover:text-[#F6D778] text-[11px] font-retro py-1.5 px-2 rounded border border-[#55437d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                  <span>加入 Google 日曆</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playBlip();
                    downloadIcsFile(quest, wagePerHour, budgetMode, monthlyAllowance);
                  }}
                  className="pixel-btn bg-[#2b2149] hover:bg-[#3d2f63] text-white hover:text-[#6ee7b7] text-[11px] font-retro py-1.5 px-2 rounded border border-[#55437d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#6ee7b7] shrink-0" />
                  <span>下載行事曆檔案（Apple／其他行事曆）</span>
                </button>
              </div>
            </div>
          </div>

          {/* Philosophy / Mindful Prompt */}
          <div className="bg-[#382c59] p-3 rounded border border-[#6b559b]/50 text-xs text-[#F4D9F0] leading-relaxed">
            <p className="font-retro font-bold text-[#F6D778] mb-1">
              💡 公會長老提點：
            </p>
            <p>
              冷靜期不是為了限制你的快樂，而是過濾掉「短暫被刺激」的非必要購買。
              經過這段等待，現在的你若依然非常需要且真心喜歡，那它就是值得的消費；若熱情已降溫，守住這筆預算就是你的偉大勝利！
            </p>
          </div>

          {/* Optional Reflection Note */}
          <div>
            <label className="block text-xs font-retro text-[#F4D9F0] mb-1">
              此時此刻的想法或心得 (選填，將記錄於冒險日誌)：
            </label>
            <input
              type="text"
              placeholder="例如：熱情退了，不買也不影響生活 / 想了很久還是很實用，決定入手..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#211a36] border border-[#5a4682] rounded text-white text-xs focus:outline-none focus:border-[#F6D778]"
            />
          </div>

          {/* Decision Choices */}
          {activeStep === 'options' ? (
            <div className="space-y-2.5 pt-2">
              {onOpenSoulQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSoulQuiz(quest);
                  }}
                  className="w-full text-left p-3 bg-[#38265a] hover:bg-[#46306e] border-2 border-[#8B65C7] rounded-md transition-all group flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-[#2a1c45] text-[#F6D778]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-retro font-bold text-xs sm:text-sm text-[#F6D778] group-hover:underline">
                        🧠 難以抉擇？先進入靈魂拷問室
                      </span>
                      <p className="text-[11px] text-[#F4D9F0]/70 font-sans">
                        透過 5 題靈魂提問，獲得客觀中立的「購物判斷卡」
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#F6D778] font-retro font-bold">開始檢驗 →</span>
                </button>
              )}

              {/* Option A: Abandon & Save Budget */}
              <button
                type="button"
                onClick={handleAbandon}
                className="w-full text-left p-3.5 bg-[#254238] hover:bg-[#2e5246] border-2 border-[#4ade80] rounded-md transition-all group flex items-start gap-3 cursor-pointer shadow-md"
              >
                <div className="p-2 rounded bg-[#1e362e] text-[#4ade80] mt-0.5 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-retro font-bold text-sm text-white group-hover:text-[#6ee7b7]">
                      🛡️ 放棄購買・保住預算
                    </span>
                    <span className="font-pixel text-[11px] text-[#F6D778] font-bold">
                      +100 EXP
                    </span>
                  </div>
                  <p className="text-xs text-[#D7EEDB]/80 mt-1">
                    熱情已降溫！將 <strong className="font-mono text-white">NT$ {quest.price.toLocaleString()}</strong> 全數計入累積保住的預算。
                  </p>
                </div>
              </button>

              {/* Option B: Extend Cooldown */}
              <button
                type="button"
                onClick={() => setActiveStep('extendSelect')}
                className="w-full text-left p-3.5 bg-[#312351] hover:bg-[#3d2b65] border border-[#8B65C7] rounded-md transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded bg-[#23183d] text-[#8B65C7] mt-0.5 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-retro font-bold text-sm text-white group-hover:text-[#F6D778]">
                      ⏳ 延長冷靜期・再想一想
                    </span>
                    <span className="font-pixel text-[11px] text-[#F6D778] font-bold">
                      +15 EXP
                    </span>
                  </div>
                  <p className="text-xs text-[#F4D9F0]/70 mt-1">
                    心裡還在猶豫不決？多給自己 24 小時、3 天或 7 天重新評估。
                  </p>
                </div>
              </button>

              {/* Option C: Purchase Mindfully */}
              <button
                type="button"
                onClick={handlePurchase}
                className="w-full text-left p-3.5 bg-[#251e3c] hover:bg-[#2d2448] border border-[#5b4883] rounded-md transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded bg-[#1c162f] text-[#F4D9F0] mt-0.5 shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-retro font-bold text-sm text-white group-hover:text-[#c4b5fd]">
                      🛍️ 深思熟慮・確認購買
                    </span>
                    <span className="font-pixel text-[11px] text-[#F6D778] font-bold">
                      +30 EXP
                    </span>
                  </div>
                  <p className="text-xs text-[#F4D9F0]/70 mt-1">
                    冷靜期後仍確定需要，這是健康的理性消費，絕非浪費。
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Extend Period Selection */
            <div className="space-y-3 pt-2">
              <h4 className="font-retro font-bold text-sm text-[#F6D778]">
                請選擇要再延長的冷靜時長：
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { hours: 24, label: '+24 小時', desc: '再等等一天' },
                  { hours: 72, label: '+3 天', desc: '渡過週末' },
                  { hours: 168, label: '+7 天', desc: '整整一週' },
                ].map((opt) => (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setSelectedExtendHours(opt.hours)}
                    className={`p-3 rounded border text-center transition-all ${
                      selectedExtendHours === opt.hours
                        ? 'border-[#F6D778] bg-[#463270] text-[#F6D778] font-bold'
                        : 'border-[#5a4682] bg-[#211a36] text-[#F4D9F0]/80 hover:bg-[#2b1f48]'
                    }`}
                  >
                    <div className="font-retro text-sm">{opt.label}</div>
                    <div className="text-[10px] text-[#F4D9F0]/60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#45366c]">
                <button
                  type="button"
                  onClick={() => setActiveStep('options')}
                  className="px-3 py-1.5 text-xs text-[#F4D9F0]/80 hover:text-white rounded"
                >
                  返回選項
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-4 py-2 text-xs font-bold rounded"
                >
                  確認延長冷靜期
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
