import React, { useState } from 'react';
import { BudgetMode, QuestCategory } from '../types/quest';
import { CATEGORIES } from '../utils/category';
import { X, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { getBudgetEquivalent } from '../utils/budget';

interface NewQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    cooldownHours: number;
    category: QuestCategory;
    url?: string;
    note?: string;
  }) => void;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
}

export const NewQuestModal: React.FC<NewQuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
}) => {
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [cooldownOption, setCooldownOption] = useState<'24h' | '3d' | '7d' | 'custom'>('3d');
  const [customDays, setCustomDays] = useState('5');
  const [category, setCategory] = useState<QuestCategory>('clothing');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const price = parseFloat(priceStr);
  const budgetEquivalent = !isNaN(price) && price > 0
    ? getBudgetEquivalent(price, budgetMode, wagePerHour, monthlyAllowance)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入商品名稱');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError('請輸入有效的商品價格（大於 0 的數字）');
      return;
    }

    let hours = 72; // default 3 days
    if (cooldownOption === '24h') hours = 24;
    else if (cooldownOption === '3d') hours = 72;
    else if (cooldownOption === '7d') hours = 168;
    else if (cooldownOption === 'custom') {
      const parsedDays = parseInt(customDays, 10);
      hours = (!isNaN(parsedDays) && parsedDays > 0) ? parsedDays * 24 : 72;
    }

    soundManager.playAcceptQuest();
    onSubmit({
      name: name.trim(),
      price: Math.round(price),
      cooldownHours: hours,
      category,
      url: url.trim() || undefined,
      note: note.trim() || undefined,
    });

    // Reset fields
    setName('');
    setPriceStr('');
    setUrl('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#30254D] border-2 border-[#8B65C7] rounded-lg pixel-box shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#251b3d] border-b border-[#4d3a77] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6D778]" />
            <h2 className="font-retro font-bold text-base sm:text-lg text-white">
              【接受新任務】記錄心動商品
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#F4D9F0]/60 hover:text-white p-1 rounded hover:bg-[#382a5c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1">
              商品名稱 <span className="text-[#F6D778]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：復古工裝外套、機械鍵盤..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 bg-[#211a36] border border-[#5a4682] rounded text-white text-sm focus:outline-none focus:border-[#F6D778]"
            />
          </div>

          {/* Price & Reality Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1">
                商品價格 (NT$) <span className="text-[#F6D778]">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="例如：1280"
                value={priceStr}
                onChange={(e) => {
                  setPriceStr(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 bg-[#211a36] border border-[#5a4682] rounded text-white text-sm font-mono focus:outline-none focus:border-[#F6D778]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1">
                商品類別
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="w-full px-3 py-2 bg-[#211a36] border border-[#5a4682] rounded text-white text-sm focus:outline-none focus:border-[#F6D778]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reality Check Note */}
          {budgetEquivalent && (
            <div className="px-3 py-2 bg-[#261c3d] border border-[#F6D778]/40 rounded text-xs text-[#F6D778] flex items-center justify-between font-retro">
              <span>預算換算：</span>
              <span>{budgetEquivalent}</span>
            </div>
          )}

          {/* Cooldown Period Selection (PRD: 24小時, 3天, 7天) */}
          <div>
            <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1.5 flex items-center justify-between">
              <span>設定冷靜期長度 <span className="text-[#F6D778]">*</span></span>
              <span className="text-[11px] text-[#F4D9F0]/60">以時間沈澱購買衝動</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCooldownOption('24h')}
                className={`py-2 px-2 text-xs font-retro rounded border transition-colors ${
                  cooldownOption === '24h'
                    ? 'border-[#F6D778] bg-[#463270] text-[#F6D778] font-bold shadow-xs'
                    : 'border-[#5a4682] bg-[#211a36] text-[#F4D9F0]/80 hover:bg-[#2b1f48]'
                }`}
              >
                24 小時
                <span className="block text-[10px] text-[#F4D9F0]/60 font-normal mt-0.5">小額試探</span>
              </button>

              <button
                type="button"
                onClick={() => setCooldownOption('3d')}
                className={`py-2 px-2 text-xs font-retro rounded border transition-colors ${
                  cooldownOption === '3d'
                    ? 'border-[#F6D778] bg-[#463270] text-[#F6D778] font-bold shadow-xs'
                    : 'border-[#5a4682] bg-[#211a36] text-[#F4D9F0]/80 hover:bg-[#2b1f48]'
                }`}
              >
                3 天 (推薦)
                <span className="block text-[10px] text-[#F4D9F0]/60 font-normal mt-0.5">衣服與生活品</span>
              </button>

              <button
                type="button"
                onClick={() => setCooldownOption('7d')}
                className={`py-2 px-2 text-xs font-retro rounded border transition-colors ${
                  cooldownOption === '7d'
                    ? 'border-[#F6D778] bg-[#463270] text-[#F6D778] font-bold shadow-xs'
                    : 'border-[#5a4682] bg-[#211a36] text-[#F4D9F0]/80 hover:bg-[#2b1f48]'
                }`}
              >
                7 天
                <span className="block text-[10px] text-[#F4D9F0]/60 font-normal mt-0.5">高價與3C</span>
              </button>
            </div>
          </div>

          {/* Product URL */}
          <div>
            <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1">
              商品網址 <span className="text-[#F4D9F0]/50 font-normal">(選填)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#211a36] border border-[#5a4682] rounded text-white text-sm focus:outline-none focus:border-[#F6D778]"
            />
          </div>

          {/* Purchase Reason & Notes */}
          <div>
            <label className="block text-xs font-retro font-bold text-[#F4D9F0] mb-1">
              為什麼想買？這刻的心動原因 <span className="text-[#F4D9F0]/50 font-normal">(選填，日後冷靜回顧時很管用)</span>
            </label>
            <textarea
              rows={3}
              placeholder="例如：看到限時 8 折被燒到、朋友穿這件很好看、工作壓力大想犒賞自己..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#211a36] border border-[#5a4682] rounded text-white text-sm focus:outline-none focus:border-[#F6D778] resize-none"
            />
            <div className="p-2.5 bg-[#251c3d] rounded border border-[#523d7a] text-[11px] text-[#F4D9F0]/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F6D778] shrink-0" />
              <span>建立後可將冷靜期結束時間<strong>一鍵加入 Google 日曆</strong>或<strong>下載 Apple / 其它行事曆檔案 (.ics)</strong>，準時提醒理性回顧！</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#45366c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#F4D9F0]/80 hover:text-white rounded font-retro"
            >
              取消
            </button>
            <button
              type="submit"
              className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-5 py-2 text-sm font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Clock className="w-4 h-4 text-[#F6D778]" />
              <span>啟動冷靜期任務 (+5 EXP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
