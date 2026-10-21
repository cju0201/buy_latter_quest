import React from 'react';
import { LevelInfo } from '../utils/level';
import { BudgetMode } from '../types/quest';
import { getBudgetEquivalent } from '../utils/budget';
import { Shield, Sparkles, Coins, Clock, CheckCircle2, ChevronRight, Edit3 } from 'lucide-react';
import { soundManager } from '../utils/sound';
import guildHero from '../assets/images/quest_guild_hero_1792499559183.jpg';
import guildBadge from '../assets/images/adventurer_guild_badge_1792499558716.jpg';

interface AdventurerHUDProps {
  levelInfo: LevelInfo;
  totalExp: number;
  totalSaved: number;
  activeCount: number;
  reviewCount: number;
  purchasedCount: number;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
  onSaveBudgetSettings: (mode: BudgetMode, amount: number) => void;
  onOpenNewQuest: () => void;
  onOpenReviewFilter: () => void;
}

export const AdventurerHUD: React.FC<AdventurerHUDProps> = ({
  levelInfo,
  totalExp,
  totalSaved,
  activeCount,
  reviewCount,
  purchasedCount,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
  onSaveBudgetSettings,
  onOpenNewQuest,
  onOpenReviewFilter,
}) => {
  const [isEditingBudget, setIsEditingBudget] = React.useState(false);
  const [editingBudgetMode, setEditingBudgetMode] = React.useState<BudgetMode>(budgetMode);
  const [wageInput, setWageInput] = React.useState(wagePerHour.toString());
  const [allowanceInput, setAllowanceInput] = React.useState(monthlyAllowance.toString());

  const openBudgetSettings = () => {
    setEditingBudgetMode(budgetMode);
    setWageInput(wagePerHour.toString());
    setAllowanceInput(monthlyAllowance > 0 ? monthlyAllowance.toString() : '');
    setIsEditingBudget(true);
  };

  const handleSaveBudgetSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(editingBudgetMode === 'hourly' ? wageInput : allowanceInput);
    if (!isNaN(parsed) && parsed > 0) {
      onSaveBudgetSettings(editingBudgetMode, parsed);
      setIsEditingBudget(false);
      soundManager.playBlip();
    }
  };

  // Saved hours of labor
  const savedHoursOfWork = wagePerHour > 0 ? (totalSaved / wagePerHour).toFixed(1) : '0';

  return (
    <div className="relative overflow-hidden rounded-lg pixel-box mb-8">
      {/* Background RPG Guild Atmosphere */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#1c142e]">
        <img
          src={guildHero}
          alt="冒險者公會大廳"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-75 scale-105 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211A36]/80 via-[#211A36]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#211A36]/35 via-transparent to-[#211A36]/35" />

        {/* Guild Welcome Banner Content */}
        <div className="absolute inset-x-0 bottom-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded border-2 border-[#F6D778] overflow-hidden pixel-box-gold bg-[#211A36] shadow-lg">
              <img
                src={guildBadge}
                alt="公會徽章"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[#F6D778] text-xs sm:text-sm tracking-wider">
                  Lv.{levelInfo.level.toString().padStart(2, '0')}
                </span>
                <span className="text-white font-bold text-sm sm:text-base font-retro tracking-wide">
                  {levelInfo.title}
                </span>
              </div>
              <p className="text-xs text-[#F4D9F0]/80 mt-0.5 font-retro">
                以時間換取理智，用冷靜擊退衝動魔王
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewQuest}
              className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-4 py-2 text-xs font-bold rounded inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>＋ 登錄心動商品</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXP Progress Bar & Level Detail */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#2a1f45] border-t border-b border-[#45356e]">
        <div className="flex items-center justify-between text-xs font-retro mb-1.5">
          <span className="text-[#F4D9F0]/90 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#8B65C7]" />
            {levelInfo.isMaxLevel
              ? '經驗值進度（已達最高等級）'
              : `經驗值進度（距離升級還需 ${levelInfo.nextLevelExp - levelInfo.currentLevelExp} EXP）`}
          </span>
          <span className="font-mono text-[#F6D778] tabular-nums font-semibold">
            {levelInfo.isMaxLevel
              ? '最高等級'
              : `${levelInfo.currentLevelExp} / ${levelInfo.nextLevelExp} EXP (${levelInfo.progressPercent}%)`}
          </span>
        </div>
        <div className="w-full h-3 bg-[#181126] rounded-sm overflow-hidden border border-[#524177] p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#8B65C7] to-[#F6D778] rounded-xs transition-all duration-500 ease-out"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Core RPG KPI Cards Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#30254D]">
        {/* Metric 1: 累積保住的預算 */}
        <div className="pixel-box-gold rounded p-3 sm:p-4 bg-[#342754] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#F6D778] mb-1">
            <span className="text-xs font-retro font-bold">累積保住預算</span>
            <Coins className="w-4 h-4 text-[#F6D778]" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold font-mono text-[#F6D778] tabular-nums tracking-tight">
              NT$ {totalSaved.toLocaleString()}
            </div>
            <div className="mt-2 flex flex-col items-start gap-1.5">
              <span className="text-[10px] leading-relaxed text-[#F4D9F0]/75">
                {budgetMode === 'hourly'
                  ? `以時薪 NT$ ${wagePerHour.toLocaleString()} 計算，約 ${savedHoursOfWork} 小時工資`
                  : `${getBudgetEquivalent(totalSaved, budgetMode, wagePerHour, monthlyAllowance)}（每月零用錢 NT$ ${monthlyAllowance.toLocaleString()}）`}
              </span>
              <button
                onClick={openBudgetSettings}
                type="button"
                aria-expanded={isEditingBudget}
                className="inline-flex items-center gap-1 rounded border border-[#F6D778]/50 px-2 py-1 text-[10px] font-bold text-[#F6D778] hover:bg-[#F6D778]/10 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                預算換算設定
              </button>
            </div>
          </div>
        </div>

        {/* Metric 2: 進行中冷靜任務 */}
        <div className="pixel-box rounded p-3 sm:p-4 bg-[#2e234c] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#F4D9F0] mb-1">
            <span className="text-xs font-retro font-bold">進行中任務</span>
            <Clock className="w-4 h-4 text-[#8B65C7]" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums">
              {activeCount} <span className="text-xs font-retro text-[#F4D9F0]/70">件商品</span>
            </div>
            <p className="text-[11px] text-[#F4D9F0]/70 mt-1">
              冷靜鐘擺擺動中
            </p>
          </div>
        </div>

        {/* Metric 3: 待重新評估 (PRD: 到期任務提醒) */}
        <div 
          onClick={reviewCount > 0 ? onOpenReviewFilter : undefined}
          className={`rounded p-3 sm:p-4 flex flex-col justify-between transition-all ${
            reviewCount > 0 
              ? 'pixel-box-gold bg-[#3d2c61] cursor-pointer hover:bg-[#463270]' 
              : 'pixel-box bg-[#2e234c]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-retro font-bold ${reviewCount > 0 ? 'text-[#F6D778]' : 'text-[#F4D9F0]'}`}>
              待重新評估
            </span>
            <Sparkles className={`w-4 h-4 ${reviewCount > 0 ? 'text-[#F6D778] animate-bounce' : 'text-[#F4D9F0]/50'}`} />
          </div>
          <div>
            <div className={`text-lg sm:text-2xl font-bold font-mono tabular-nums ${reviewCount > 0 ? 'text-[#F6D778]' : 'text-white'}`}>
              {reviewCount} <span className="text-xs font-retro text-[#F4D9F0]/70">件到期</span>
            </div>
            <div className="text-[11px] mt-1 flex items-center justify-between">
              <span className={reviewCount > 0 ? 'text-[#F6D778] font-bold' : 'text-[#F4D9F0]/70'}>
                {reviewCount > 0 ? '冷靜期滿！點擊回顧' : '暫無到期商品'}
              </span>
              {reviewCount > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#F6D778]" />}
            </div>
          </div>
        </div>

        {/* Metric 4: 理性購買決策 */}
        <div className="pixel-box rounded p-3 sm:p-4 bg-[#2e234c] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#D7EEDB] mb-1">
            <span className="text-xs font-retro font-bold">深思後購買</span>
            <CheckCircle2 className="w-4 h-4 text-[#6ee7b7]" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold font-mono text-[#D7EEDB] tabular-nums">
              {purchasedCount} <span className="text-xs font-retro text-[#F4D9F0]/70">件必要物</span>
            </div>
            <p className="text-[11px] text-[#F4D9F0]/70 mt-1">
              思考後買下，心安理得
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Wage Customization Drawer/Bar */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudgetSettings} className="px-4 sm:px-6 py-3 bg-[#251b3d] border-t border-[#45356e] space-y-3 text-xs">
          <div>
            <h3 className="text-[#F4D9F0] font-bold">預算換算設定</h3>
            <p className="mt-1 text-[11px] text-[#F4D9F0]/65">選擇一種方式，估算商品金額相當於多少工資或零用錢。</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="預算換算方式">
            <button type="button" onClick={() => setEditingBudgetMode('hourly')} className={`rounded border px-3 py-2 font-bold ${editingBudgetMode === 'hourly' ? 'border-[#F6D778] bg-[#47346b] text-[#F6D778]' : 'border-[#5a4682] text-[#F4D9F0]/70'}`}>
              以預估時薪計算
            </button>
            <button type="button" onClick={() => setEditingBudgetMode('monthly_allowance')} className={`rounded border px-3 py-2 font-bold ${editingBudgetMode === 'monthly_allowance' ? 'border-[#F6D778] bg-[#47346b] text-[#F6D778]' : 'border-[#5a4682] text-[#F4D9F0]/70'}`}>
              以每月零用錢計算
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="budget-amount" className="text-[#F4D9F0]">
              {editingBudgetMode === 'hourly' ? '預估時薪：' : '每月可用零用錢：'}
            </label>
            <span className="text-[#F4D9F0]/80">NT$</span>
            <input
              id="budget-amount"
              type="number"
              min="1"
              step="1"
              required
              value={editingBudgetMode === 'hourly' ? wageInput : allowanceInput}
              onChange={(e) => editingBudgetMode === 'hourly' ? setWageInput(e.target.value) : setAllowanceInput(e.target.value)}
              aria-label={editingBudgetMode === 'hourly' ? '每小時預估工資' : '每月零用錢金額'}
              className="w-32 px-2 py-1.5 bg-[#1a122b] border border-[#6b559b] rounded text-white font-mono"
              autoFocus
            />
            <span className="text-[#F4D9F0]/80">／{editingBudgetMode === 'hourly' ? '小時' : '月'}</span>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-[#8B65C7] text-white rounded font-bold hover:bg-[#9d71e8]">保存設定</button>
            <button type="button" onClick={() => setIsEditingBudget(false)} className="px-3 py-1.5 text-[#F4D9F0]/70 hover:text-white">取消</button>
          </div>
        </form>
      )}
    </div>
  );
};
