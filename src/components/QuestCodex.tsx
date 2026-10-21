import React, { useState } from 'react';
import { BudgetMode, QuestItem, QuestStatus, QuestCategory } from '../types/quest';
import { QuestCard } from './QuestCard';
import { CATEGORIES } from '../utils/category';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface QuestCodexProps {
  quests: QuestItem[];
  nowMs: number;
  initialFilter?: string;
  onOpenDecision: (quest: QuestItem) => void;
  onQuickAbandon: (quest: QuestItem) => void;
  onQuickExtend: (quest: QuestItem, hours: number) => void;
  onDeleteQuest: (questId: string) => void;
  onOpenNewQuest: () => void;
  onOpenSoulQuiz?: (quest: QuestItem) => void;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
}

export const QuestCodex: React.FC<QuestCodexProps> = ({
  quests,
  nowMs,
  initialFilter = 'all',
  onOpenDecision,
  onQuickAbandon,
  onQuickExtend,
  onDeleteQuest,
  onOpenNewQuest,
  onOpenSoulQuiz,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'created' | 'priceAsc' | 'priceDesc'>('deadline');

  const filteredQuests = quests.filter((q) => {
    // Status check
    const isExpired = new Date(q.deadline).getTime() <= nowMs;
    const effectiveStatus = (q.status === 'waiting' && isExpired) ? 'review' : q.status;

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        if (effectiveStatus !== 'waiting' && effectiveStatus !== 'review') return false;
      } else if (effectiveStatus !== statusFilter) {
        return false;
      }
    }

    // Category check
    if (categoryFilter !== 'all' && q.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = q.name.toLowerCase().includes(query);
      const matchNote = q.note ? q.note.toLowerCase().includes(query) : false;
      if (!matchName && !matchNote) return false;
    }

    return true;
  });

  // Sort
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'priceDesc') {
      return b.price - a.price;
    }
    if (sortBy === 'priceAsc') {
      return a.price - b.price;
    }
    return 0;
  });

  const countByStatus = {
    all: quests.length,
    waiting: quests.filter(q => q.status === 'waiting' && new Date(q.deadline).getTime() > nowMs).length,
    review: quests.filter(q => q.status === 'review' || (q.status === 'waiting' && new Date(q.deadline).getTime() <= nowMs)).length,
    abandoned: quests.filter(q => q.status === 'abandoned').length,
    purchased: quests.filter(q => q.status === 'purchased').length,
  };

  const handleTabChange = (key: string) => {
    soundManager.playBlip();
    setStatusFilter(key);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-retro text-white flex items-center gap-2">
            <span>📖 任務圖鑑</span>
            <span className="text-xs font-mono text-[#F4D9F0]/60">
              ({sortedQuests.length} / {quests.length})
            </span>
          </h2>
          <p className="text-xs text-[#F4D9F0]/70 mt-1 font-retro">
            檢閱每一筆心動商品的冷靜紀錄與最終抉擇
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#F4D9F0]/50" />
          <input
            type="text"
            placeholder="搜尋商品名稱或心動備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#30254D] border border-[#524177] rounded text-white text-xs focus:outline-none focus:border-[#F6D778]"
          />
        </div>
      </div>

      {/* Interactive Segmented Control Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#231a3b] rounded-lg border border-[#48376f]">
        {[
          { key: 'all', label: '全部任務', count: countByStatus.all },
          { key: 'waiting', label: '冷靜中', count: countByStatus.waiting },
          { key: 'review', label: '待評估', count: countByStatus.review, highlight: countByStatus.review > 0 },
          { key: 'abandoned', label: '已守住預算', count: countByStatus.abandoned },
          { key: 'purchased', label: '深思後購買', count: countByStatus.purchased },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-1.5 text-xs font-retro rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#8B65C7] text-white font-bold shadow-xs'
                : tab.highlight
                ? 'text-[#F6D778] font-bold hover:bg-[#342754]'
                : 'text-[#F4D9F0]/70 hover:text-white hover:bg-[#342754]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="font-mono text-[11px] opacity-80">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Sub Filters: Category & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#F4D9F0]/60" />
          <span className="text-[#F4D9F0]/70 font-retro">類別篩選：</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              soundManager.playBlip();
              setCategoryFilter(e.target.value);
            }}
            className="px-2.5 py-1 bg-[#30254D] border border-[#524177] rounded text-white focus:outline-none focus:border-[#F6D778]"
          >
            <option value="all">所有類別</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#F4D9F0]/60" />
          <span className="text-[#F4D9F0]/70 font-retro">排序方式：</span>
          <select
            value={sortBy}
            onChange={(e) => {
              soundManager.playBlip();
              setSortBy(e.target.value as typeof sortBy);
            }}
            className="px-2.5 py-1 bg-[#30254D] border border-[#524177] rounded text-white focus:outline-none focus:border-[#F6D778]"
          >
            <option value="deadline">截止時間 (即將到期優先)</option>
            <option value="created">建立時間 (最新優先)</option>
            <option value="priceDesc">金額由高到低</option>
            <option value="priceAsc">金額由低到高</option>
          </select>
        </div>
      </div>

      {/* Quest Cards Grid */}
      {sortedQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              nowMs={nowMs}
              onOpenDecision={onOpenDecision}
              onQuickAbandon={onQuickAbandon}
              onQuickExtend={onQuickExtend}
              onDeleteQuest={onDeleteQuest}
              onOpenSoulQuiz={onOpenSoulQuiz}
              wagePerHour={wagePerHour}
              budgetMode={budgetMode}
              monthlyAllowance={monthlyAllowance}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#30254D]/50 border-2 border-dashed border-[#4a3b75] rounded-lg pixel-box">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="font-retro text-lg text-white font-bold mb-1">
            目前沒有符合條件的任務
          </h3>
          <p className="text-xs text-[#F4D9F0]/70 max-w-sm mx-auto mb-4 font-retro">
            在購物網站看到心動想要的東西了嗎？立刻登錄你的下一筆冷靜任務吧！
          </p>
          <button
            onClick={onOpenNewQuest}
            className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-4 py-2 text-xs font-bold rounded inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>＋ 登錄心動商品</span>
          </button>
        </div>
      )}
    </div>
  );
};
