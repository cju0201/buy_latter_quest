import React, { useState } from 'react';
import { ChronicleLog, QuestItem } from '../types/quest';
import { formatDateTime } from '../utils/time';
import { ScrollText, Download, Upload, RotateCcw, ShieldCheck, ShoppingCart, Clock, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AdventureChronicleProps {
  logs: ChronicleLog[];
  quests: QuestItem[];
  totalSaved: number;
  totalSpent: number;
  totalExp: number;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
}

export const AdventureChronicle: React.FC<AdventureChronicleProps> = ({
  logs,
  quests,
  totalSaved,
  totalSpent,
  totalExp,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const totalConsidered = totalSaved + totalSpent;
  const savedRate = totalConsidered > 0 ? Math.round((totalSaved / totalConsidered) * 100) : 100;

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportData(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card: Budget Ratio */}
      <div className="p-5 rounded-lg pixel-box bg-[#30254D] grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric A */}
        <div className="p-3.5 bg-[#251b3d] rounded border border-[#48376f] flex flex-col justify-between">
          <span className="text-xs font-retro text-[#6ee7b7] flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" />
            累積保住的預算
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-[#6ee7b7] tabular-nums">
              NT$ {totalSaved.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#F4D9F0]/60 font-retro">
              省下的就是自己賺到的
            </span>
          </div>
        </div>

        {/* Metric B */}
        <div className="p-3.5 bg-[#251b3d] rounded border border-[#48376f] flex flex-col justify-between">
          <span className="text-xs font-retro text-[#F4D9F0]/90 flex items-center gap-1.5 font-bold">
            <ShoppingCart className="w-4 h-4 text-[#8B65C7]" />
            深思熟慮後消費
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              NT$ {totalSpent.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#F4D9F0]/60 font-retro">
              經冷靜期確認的必要支出
            </span>
          </div>
        </div>

        {/* Metric C: Ratio */}
        <div className="p-3.5 bg-[#251b3d] rounded border border-[#48376f] flex flex-col justify-between">
          <span className="text-xs font-retro text-[#F6D778] flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4" />
            衝動克制率
          </span>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-[#F6D778] tabular-nums">
              {savedRate}%
            </div>
            {/* Visual ratio bar */}
            <div className="w-full h-2 bg-[#1b122e] rounded-xs overflow-hidden mt-1.5 border border-[#524177]">
              <div
                className="h-full bg-[#6ee7b7] transition-all duration-500"
                style={{ width: `${savedRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-retro text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#F6D778]" />
            <span>冒險編年史 · 決策時光軸</span>
          </h2>
          <p className="text-xs text-[#F4D9F0]/70 font-retro mt-0.5">
            每一次的猶豫與取捨，都是成為成熟理性冒險者的印記
          </p>
        </div>

        {/* Backup / Export Tools */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              soundManager.playBlip();
              onExportData();
            }}
            className="px-3 py-1.5 bg-[#30254D] border border-[#524177] hover:border-[#8B65C7] rounded text-white flex items-center gap-1 font-retro"
          >
            <Download className="w-3.5 h-3.5 text-[#F6D778]" />
            <span>匯出備份</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBlip();
              fileInputRef.current?.click();
            }}
            className="px-3 py-1.5 bg-[#30254D] border border-[#524177] hover:border-[#8B65C7] rounded text-white flex items-center gap-1 font-retro"
          >
            <Upload className="w-3.5 h-3.5 text-[#8B65C7]" />
            <span>匯入紀錄</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              soundManager.playBlip();
              onResetData();
            }}
            title="重設為示範資料"
            className="px-2 py-1.5 text-[#F4D9F0]/50 hover:text-red-400 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs font-retro overflow-x-auto pb-1">
        {[
          { key: 'all', label: '全部記錄' },
          { key: 'abandoned', label: '放棄/保住預算' },
          { key: 'purchased', label: '深思購買' },
          { key: 'created', label: '新接任務' },
          { key: 'extended', label: '延長等待' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={filterType === tab.key}
            onClick={() => {
              soundManager.playBlip();
              setFilterType(tab.key);
            }}
            className={`pixel-btn pixel-filter-btn px-3 py-1.5 rounded-sm whitespace-nowrap transition-all ${
              filterType === tab.key
                ? 'bg-[#8B65C7] border-[#D6BCFF] text-white font-bold shadow-[0_4px_0_#150e26,0_5px_10px_rgba(0,0,0,0.3)]'
                : 'bg-[#30254D] border-[#65508D] text-[#F4D9F0]/85 shadow-[0_4px_0_#150e26] hover:bg-[#49366E] hover:border-[#9B7BCB] hover:text-white hover:-translate-y-0.5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const isAbandon = log.type === 'abandoned';
            const isPurchase = log.type === 'purchased';
            const isExtend = log.type === 'extended';
            const isCreated = log.type === 'created';

            return (
              <div
                key={log.id}
                className="p-3.5 rounded bg-[#2a1f45] border border-[#46356e] flex items-start justify-between gap-3 font-retro"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-7 h-7 rounded flex items-center justify-center text-sm shrink-0 bg-[#1c142e] border border-[#524177]">
                    {isAbandon && '🛡️'}
                    {isPurchase && '🛍️'}
                    {isExtend && '⏳'}
                    {isCreated && '📜'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {log.questName}
                      </span>
                      {log.amount !== undefined && (
                        <span className={`font-mono font-bold text-xs ${isAbandon ? 'text-[#6ee7b7]' : 'text-[#F6D778]'}`}>
                          {isAbandon ? `+保住 NT$ ${log.amount.toLocaleString()}` : `NT$ ${log.amount.toLocaleString()}`}
                        </span>
                      )}
                    </div>

                    {log.note && (
                      <p className="text-xs text-[#F4D9F0]/80 mt-1 italic font-sans leading-relaxed">
                        「{log.note}」
                      </p>
                    )}

                    <div className="text-[10px] text-[#F4D9F0]/50 mt-1 font-mono">
                      {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-pixel text-[11px] text-[#F6D778] font-bold">
                    +{log.expGained} EXP
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-xs text-[#F4D9F0]/60 bg-[#251b3d] rounded-lg border border-[#48376f] font-retro">
            尚無相關歷史紀錄
          </div>
        )}
      </div>
    </div>
  );
};
