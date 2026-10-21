import React from 'react';
import { BudgetMode, QuestItem } from '../types/quest';
import { calculateTimeRemaining, formatDateTime } from '../utils/time';
import { getCategoryMeta } from '../utils/category';
import { Clock, ExternalLink, ShieldAlert, Sparkles, Check, Trash2, ArrowUpRight, Brain, Calendar, CalendarPlus, Download } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { openGoogleCalendar, downloadIcsFile } from '../utils/calendar';
import { getBudgetEquivalent } from '../utils/budget';

interface QuestCardProps {
  quest: QuestItem;
  nowMs: number;
  onOpenDecision: (quest: QuestItem) => void;
  onQuickAbandon: (quest: QuestItem) => void;
  onQuickExtend: (quest: QuestItem, hours: number) => void;
  onDeleteQuest: (questId: string) => void;
  onOpenSoulQuiz?: (quest: QuestItem) => void;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  nowMs,
  onOpenDecision,
  onQuickAbandon,
  onQuickExtend,
  onDeleteQuest,
  onOpenSoulQuiz,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const categoryMeta = getCategoryMeta(quest.category);
  const timeInfo = calculateTimeRemaining(quest.createdAt, quest.deadline, nowMs);

  const isReviewReady = quest.status === 'review' || (quest.status === 'waiting' && timeInfo.isExpired);
  const isWaiting = quest.status === 'waiting' && !timeInfo.isExpired;
  const isPurchased = quest.status === 'purchased';
  const isAbandoned = quest.status === 'abandoned';

  const budgetEquivalent = getBudgetEquivalent(quest.price, budgetMode, wagePerHour, monthlyAllowance);

  return (
    <div
      className={`rounded-lg transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isReviewReady
          ? 'pixel-box-gold bg-[#39295c] ring-2 ring-[#F6D778]/80 shadow-lg'
          : isAbandoned
          ? 'pixel-box-green bg-[#263138]'
          : isPurchased
          ? 'pixel-box bg-[#29223e] opacity-90'
          : 'pixel-box bg-[#30254D] hover:border-[#7b5db3]'
      }`}
    >
      {/* Top Banner / Status Line */}
      <div className="px-4 py-2.5 border-b border-[#493970] flex items-center justify-between text-xs font-retro">
        <div className="flex items-center gap-1.5 text-[#F4D9F0]/80">
          <span>{categoryMeta.emoji}</span>
          <span>{categoryMeta.label}</span>
          {quest.extensionCount > 0 && (
            <span className="text-[#F6D778] text-[11px]">
              · 已延長 {quest.extensionCount} 次
            </span>
          )}
        </div>

        <div>
          {isReviewReady && (
            <span className="text-[#F6D778] font-bold flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              待重新評估
            </span>
          )}
          {isWaiting && (
            <span className="text-[#a481de] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              冷靜等待中
            </span>
          )}
          {isAbandoned && (
            <span className="text-[#6ee7b7] font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              成功保住預算
            </span>
          )}
          {isPurchased && (
            <span className="text-[#c4b5fd] flex items-center gap-1">
              深思後已購買
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Item Title & Price */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-base sm:text-lg text-white font-retro tracking-wide leading-snug line-clamp-2">
            {quest.name}
          </h3>
          <div className="text-right shrink-0">
            <div className={`font-mono font-bold text-lg tabular-nums ${
              isAbandoned ? 'text-[#6ee7b7] line-through opacity-80' : 'text-[#F6D778]'
            }`}>
              NT$ {quest.price.toLocaleString()}
            </div>
            {budgetEquivalent && (
              <span className="text-[10px] text-[#F4D9F0]/60 block font-retro">
                {budgetEquivalent}
              </span>
            )}
          </div>
        </div>

        {/* Note / Memo */}
        {quest.note && (
          <p className="text-xs text-[#F4D9F0]/85 bg-[#231a3b] p-2.5 rounded border border-[#433269] my-2 leading-relaxed">
            {quest.note}
          </p>
        )}

        {/* Product URL Link */}
        {quest.url && (
          <div className="mt-1 mb-2">
            <a
              href={quest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#a481de] hover:text-[#F6D778] inline-flex items-center gap-1 underline underline-offset-2 transition-colors break-all"
            >
              <span>查看商品原始連結</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}

        {/* Cooldown Timer or Outcome State */}
        <div className="mt-auto pt-3 border-t border-[#45366c]">
          {isWaiting && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-retro">
                <span className="text-[#F4D9F0]/70 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8B65C7]" />
                  剩餘冷靜時間
                </span>
                <span className="font-mono text-[#F6D778] font-bold tabular-nums">
                  {timeInfo.text}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1b132c] rounded-xs overflow-hidden border border-[#524177]">
                <div
                  className="h-full bg-[#8B65C7] rounded-xs transition-all duration-1000"
                  style={{ width: `${timeInfo.percentElapsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#F4D9F0]/50 mt-1 font-mono">
                <span>建立：{formatDateTime(quest.createdAt)}</span>
                <span>截止：{formatDateTime(quest.deadline)}</span>
              </div>
            </div>
          )}

          {isReviewReady && (
            <div className="bg-[#2a1d47] p-2.5 rounded border border-[#F6D778]/50 text-center">
              <p className="text-xs text-[#F6D778] font-retro font-bold flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                冷靜期已結束！是時候重新評估
              </p>
              <p className="text-[11px] text-[#F4D9F0]/80">
                經過等待，現在你心裡還會強烈渴望擁有它嗎？
              </p>
            </div>
          )}

          {isAbandoned && (
            <div className="bg-[#1b2623] p-2 rounded border border-[#2b4c3b] flex items-center justify-between text-xs">
              <span className="text-[#6ee7b7] font-retro flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                理智勝利！守住預算
              </span>
              <span className="font-mono text-[#6ee7b7] font-bold">
                +NT$ {quest.price.toLocaleString()}
              </span>
            </div>
          )}

          {isPurchased && (
            <div className="bg-[#241c38] p-2 rounded border border-[#4d3a77] text-xs text-[#F4D9F0]/80 font-retro">
              <span>完成冷靜評估後購買 · 理性消費無悔</span>
            </div>
          )}
        </div>

        {/* Calendar Integration Section (加入行事曆) */}
        <div className="mt-3 pt-2.5 border-t border-[#45366c]/80">
          <div className="flex items-center justify-between text-[11px] text-[#F4D9F0]/80 mb-2 font-retro">
            <span className="flex items-center gap-1 text-[#F6D778] font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#F6D778]" />
              <span>將冷靜期加入行事曆</span>
            </span>
            <span className="text-[10px] text-[#F4D9F0]/60 font-mono">
              截止：{formatDateTime(quest.deadline)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playBlip();
                openGoogleCalendar(quest, wagePerHour, budgetMode, monthlyAllowance);
              }}
              className="pixel-btn bg-[#2b2149] hover:bg-[#3d2f63] active:scale-[0.98] text-[#F4D9F0] hover:text-[#F6D778] text-[11px] font-retro py-1.5 px-2.5 rounded border border-[#55437d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="使用 Google 日曆開啟建立提醒事件畫面（自動帶入商品資訊與評估清單）"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
              <span className="truncate">加入 Google 日曆</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playBlip();
                downloadIcsFile(quest, wagePerHour, budgetMode, monthlyAllowance);
              }}
              className="pixel-btn bg-[#2b2149] hover:bg-[#3d2f63] active:scale-[0.98] text-[#F4D9F0] hover:text-[#6ee7b7] text-[11px] font-retro py-1.5 px-2.5 rounded border border-[#55437d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="下載標準 .ics 行事曆檔案（支援 Apple 行事曆、Outlook 及手機行事曆）"
            >
              <Download className="w-3.5 h-3.5 text-[#6ee7b7] shrink-0" />
              <span className="truncate">下載行事曆檔案（Apple／其他行事曆）</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-4 py-3 bg-[#261c3f] border-t border-[#493970] flex items-center justify-between gap-2">
        {/* Review Ready Actions */}
        {isReviewReady && (
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDecision(quest)}
              className="flex-1 pixel-btn bg-[#F6D778] hover:bg-[#ffe38f] text-[#211A36] font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>進行購物決策</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            {onOpenSoulQuiz && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSoulQuiz(quest);
                }}
                title="進入購物靈魂拷問室"
                className="px-2 py-2 text-xs text-[#F6D778] border border-[#6b559b] bg-[#332452] hover:bg-[#433069] rounded font-retro flex items-center gap-1 cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>拷問</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onQuickExtend(quest, 72)}
              title="快速延長 3 天冷靜期"
              className="px-2.5 py-2 text-xs text-[#F4D9F0] border border-[#5a4682] hover:bg-[#342754] rounded font-retro cursor-pointer"
            >
              +3天
            </button>
          </div>
        )}

        {/* Waiting Actions */}
        {isWaiting && (
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickAbandon(quest);
                }}
                className="pixel-btn bg-[#2d5746] hover:bg-[#356752] text-[#6ee7b7] text-xs font-retro py-1.5 px-2.5 rounded flex items-center gap-1 cursor-pointer border border-[#3f735d]"
                title="現在就覺得不需要了，提前放棄並保住預算"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>提前放棄</span>
              </button>

              {onOpenSoulQuiz && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenSoulQuiz(quest);
                  }}
                  className="px-2 py-1.5 bg-[#342454] hover:bg-[#422e6b] text-[#F6D778] border border-[#5a4286] rounded text-xs font-retro flex items-center gap-1 cursor-pointer"
                  title="進入購物靈魂拷問室重新檢視"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>靈魂拷問</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenDecision(quest);
                }}
                className="pixel-btn text-xs text-[#F6D778] hover:text-white px-2.5 py-1.5 rounded border border-[#8B65C7] bg-[#342454] hover:bg-[#47346b] font-retro inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="開啟購物決策，可選擇放棄、延長冷靜期或確認購買"
              >
                <span>購買／延長選項</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteQuest(quest.id);
                }}
                title="移除此任務"
                className="text-[#F4D9F0]/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Resolved (Purchased / Abandoned) Actions */}
        {(isPurchased || isAbandoned) && (
          <div className="w-full flex items-center justify-between text-xs text-[#F4D9F0]/60 font-retro">
            <span>決策時間：{formatDateTime(quest.decisionAt || quest.deadline)}</span>
            <button
              onClick={() => onDeleteQuest(quest.id)}
              title="清理紀錄"
              className="text-[#F4D9F0]/40 hover:text-red-400 p-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
