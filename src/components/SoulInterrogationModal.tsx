import React, { useState, useEffect } from 'react';
import { BudgetMode, QuestItem, SoulEvaluationRecord } from '../types/quest';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Brain,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { getBudgetEquivalent } from '../utils/budget';

interface SoulInterrogationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest?: QuestItem | null;
  allQuests?: QuestItem[];
  onCompleteEvaluation: (record: SoulEvaluationRecord) => void;
  onExtendCooldown?: (questId: string, hours: number) => void;
  wagePerHour: number;
  budgetMode: BudgetMode;
  monthlyAllowance: number;
}

const QUESTIONS = [
  {
    id: 1,
    title: '我是真的需要這個商品，還是只是突然很想要？',
    description: '誠實傾聽內心：它是解決生活實際困擾的必需品，還是滿足短暫感官的欲望？',
    options: [
      { text: '真的有需求', score: 0, tag: 'need' },
      { text: '想要，但不是必需品', score: 1, tag: 'want' },
      { text: '只是突然心動', score: 2, tag: 'impulse' },
    ],
  },
  {
    id: 2,
    title: '如果今天沒有折扣或優惠，我還會想買嗎？',
    description: '很多時候我們是被「打折省了多少」吸引，而非真正需要物品本身。',
    options: [
      { text: '會，原價我也打算購買', score: 0, tag: 'solid' },
      { text: '不確定，可能會猶豫很久', score: 1, tag: 'hesitant' },
      { text: '不會，純粹因為看似便宜才考慮', score: 2, tag: 'discount_trap' },
    ],
  },
  {
    id: 3,
    title: '我已經有可以替代它的物品了嗎？',
    description: '翻找記憶與抽屜：現有的物品是否具備 80% 以上相同的核心功能？',
    options: [
      { text: '沒有，身邊完全沒有替代品', score: 0, tag: 'no_sub' },
      { text: '有，但不完全符合當前需求', score: 1, tag: 'partial_sub' },
      { text: '有，而且目前運作良好還能使用', score: 2, tag: 'has_sub' },
    ],
  },
  {
    id: 4,
    title: '購買這個商品會影響我的必要支出或原本的預算嗎？',
    description: '檢視本月房租、伙食、帳單與緊急儲蓄，購買後會產生財務緊繃感嗎？',
    options: [
      { text: '完全不會，預算充裕且不影響儲蓄', score: 0, tag: 'safe_budget' },
      { text: '可能會，需要犧牲其他娛樂或節省開支', score: 1, tag: 'tight_budget' },
      { text: '會，可能導致必要生活支出受影響', score: 2, tag: 'danger_budget' },
    ],
  },
  {
    id: 5,
    title: '如果我再等幾天，我最可能有什麼感覺？',
    description: '設想 7 天後的早晨醒來，沒有這件物品的生活會受阻礙嗎？',
    options: [
      { text: '仍然很想買，而且有明確的使用場景', score: 0, tag: 'lasting_desire' },
      { text: '可能就不想買了，熱度會隨時間散去', score: 2, tag: 'cool_down' },
      { text: '還不確定，需要更多日常驗證', score: 1, tag: 'uncertain' },
    ],
  },
];

export const SoulInterrogationModal: React.FC<SoulInterrogationModalProps> = ({
  isOpen,
  onClose,
  quest,
  allQuests = [],
  onCompleteEvaluation,
  onExtendCooldown,
  wagePerHour,
  budgetMode,
  monthlyAllowance,
}) => {
  // Step: 0 to 4 are questions 1~5; step 5 is the Judgment Card
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([-1, -1, -1, -1, -1]);

  // Target item selection: 'custom' or quest.id
  const [selectedTargetId, setSelectedTargetId] = useState<string>('custom');
  const [customItemName, setCustomItemName] = useState<string>('心動待選商品');
  const [customItemPrice, setCustomItemPrice] = useState<string>('1200');

  // Initialize or reset when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedAnswers([-1, -1, -1, -1, -1]);

      if (quest) {
        setSelectedTargetId(quest.id);
        setCustomItemName(quest.name);
        setCustomItemPrice(quest.price.toString());
      } else if (allQuests.length > 0) {
        setSelectedTargetId(allQuests[0].id);
        setCustomItemName(allQuests[0].name);
        setCustomItemPrice(allQuests[0].price.toString());
      } else {
        setSelectedTargetId('custom');
        setCustomItemName('心動待選商品');
        setCustomItemPrice('1200');
      }
    }
  }, [isOpen, quest, allQuests]);

  if (!isOpen) return null;

  // Active target details
  const activeSelectedQuest = allQuests.find((q) => q.id === selectedTargetId);
  const effectiveName = activeSelectedQuest ? activeSelectedQuest.name : customItemName;
  const effectivePrice = activeSelectedQuest
    ? activeSelectedQuest.price
    : parseInt(customItemPrice, 10) || 0;
  const budgetEquivalent = effectivePrice > 0
    ? getBudgetEquivalent(effectivePrice, budgetMode, wagePerHour, monthlyAllowance)
    : null;

  // Handle target dropdown change
  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundManager.playBlip();
    const val = e.target.value;
    setSelectedTargetId(val);

    if (val !== 'custom') {
      const found = allQuests.find((q) => q.id === val);
      if (found) {
        setCustomItemName(found.name);
        setCustomItemPrice(found.price.toString());
      }
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    soundManager.playBlip();
    const updated = [...selectedAnswers];
    updated[currentStep] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (selectedAnswers[currentStep] === -1) return;
    soundManager.playBlip();

    if (currentStep === 4) {
      // Transition to Judgment Card
      soundManager.playCoin();
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    soundManager.playBlip();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Generate Judgment Advice based on actual user answers
  const generateJudgment = () => {
    const q1 = selectedAnswers[0]; // 0: need, 1: want, 2: impulse
    const q2 = selectedAnswers[1]; // 0: yes, 1: unsure, 2: discount trap
    const q3 = selectedAnswers[2]; // 0: no sub, 1: partial, 2: has sub
    const q4 = selectedAnswers[3]; // 0: safe, 1: tight, 2: danger
    const q5 = selectedAnswers[4]; // 0: still want, 1: unsure, 2: will cool down

    const adviceList: string[] = [];
    let verdictType: SoulEvaluationRecord['verdictType'] = 'green_light';
    let verdictTitle = '✨ 理性評估：深思熟慮，需求明確！';

    // 1. Budget check
    if (q4 === 2) {
      verdictType = 'caution_budget';
      verdictTitle = '⚠️ 預算警戒：可能衝擊必要生活支出！';
      adviceList.push(
        '購買此商品將影響你的生活必要開支，強烈建議先守住荷包，避免日後產生財務焦慮。'
      );
    } else if (q4 === 1) {
      adviceList.push(
        '此預算有些緊湊，需犧牲其他生活品質，建議先確認是否有其他更優先的支出。'
      );
    }

    // 2. Need vs Impulse
    if (q1 === 2 || q2 === 2 || q5 === 2) {
      if (verdictType !== 'caution_budget') {
        verdictType = 'extend_cooling';
        verdictTitle = '⏳ 心動提點：熱情正高，建議再冷靜幾天！';
      }
      adviceList.push(
        '你的回答顯示心動主要來自當下的促銷或一時情緒，過幾天熱度極可能自行退卻，強烈建議延長冷靜期。'
      );
    }

    // 3. Existing substitute
    if (q3 === 2) {
      if (verdictType === 'green_light') {
        verdictType = 'rethink_substitute';
        verdictTitle = '📦 盤點現有：家中已有功能完好的替代物！';
      }
      adviceList.push(
        '你身邊已有正常運作的替代品，新商品帶來的邊際效用有限，不妨先重溫現有物品的價值。'
      );
    }

    // 4. Genuine need
    if (q1 === 0 && q4 === 0 && q3 === 0) {
      verdictType = 'green_light';
      verdictTitle = '理性綠燈：真切需要，預算充裕無虞！';
      adviceList.push(
        '你有明確的現實痛點需要解決，且在能力負擔範圍內，這是一筆經得起考驗的健康消費！'
      );
    }

    if (adviceList.length === 0) {
      adviceList.push('經過深思，你已更清楚這件商品的定位。請相信自己的冷靜判斷！');
    }

    return { verdictType, verdictTitle, adviceList };
  };

  const judgment = generateJudgment();

  // Finish and save evaluation record
  const handleComplete = () => {
    soundManager.playCoin();
    const answersData = QUESTIONS.map((q, idx) => ({
      questionIndex: idx,
      questionText: q.title,
      selectedOption: q.options[selectedAnswers[idx]]?.text || '未回答',
      optionIndex: selectedAnswers[idx],
    }));

    const record: SoulEvaluationRecord = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      questId: activeSelectedQuest?.id,
      itemName: effectiveName,
      itemPrice: effectivePrice,
      answers: answersData,
      verdictType: judgment.verdictType,
      verdictTitle: judgment.verdictTitle,
      verdictAdvice: judgment.adviceList,
      evaluatedAt: new Date().toISOString(),
    };

    onCompleteEvaluation(record);
    onClose();
  };

  const handleRethinkExtend = () => {
    if (activeSelectedQuest && onExtendCooldown) {
      onExtendCooldown(activeSelectedQuest.id, 72);
    }
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#2a1d47] border-2 border-[#8B65C7] rounded-lg pixel-box shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-retro">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#21163b] border-b border-[#4d3a77] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#F6D778]" />
            <h2 className="font-bold text-base sm:text-lg text-white">
              【購物靈魂拷問室】{currentStep < 5 ? `第 ${currentStep + 1} / 5 題` : '購物判斷卡'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F4D9F0]/60 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluation Target Selector Bar */}
        <div className="px-5 py-3 bg-[#1d1433] border-b border-[#3b2a61] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#F6D778] font-bold shrink-0">🎯 評估對象：</span>
              <div className="relative flex-1 sm:w-64">
                <select
                  value={selectedTargetId}
                  onChange={handleTargetChange}
                  className="w-full px-2.5 py-1.5 bg-[#2b1e47] border border-[#69519c] rounded text-white text-xs focus:outline-none focus:border-[#F6D778] appearance-none pr-7 cursor-pointer"
                >
                  {allQuests.length > 0 && (
                    <optgroup label="進行中的購物任務">
                      {allQuests.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name}（NT$ {q.price.toLocaleString()}）
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="custom">➕ 自訂其他心動商品...</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#F6D778] absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs font-mono text-[#F6D778] tabular-nums self-end sm:self-auto">
              金額：NT$ {effectivePrice.toLocaleString()}{' '}
              {budgetEquivalent && <span className="text-[11px] text-[#F4D9F0]/60 font-retro">({budgetEquivalent})</span>}
            </div>
          </div>

          {/* If Custom is selected, show custom inputs */}
          {selectedTargetId === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-[#F4D9F0]/70 block mb-0.5">商品名稱：</label>
                <input
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="例如：藍牙耳機..."
                  className="w-full px-2 py-1 bg-[#150d24] border border-[#523e7a] rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#F4D9F0]/70 block mb-0.5">商品價格 (NT$)：</label>
                <input
                  type="number"
                  min="1"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-full px-2 py-1 bg-[#150d24] border border-[#523e7a] rounded text-white text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Pills */}
        <div className="px-5 py-2 bg-[#25193f] border-b border-[#3b2a61] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[0, 1, 2, 3, 4].map((stepIdx) => {
              const isAnswered = selectedAnswers[stepIdx] !== -1;
              const isCurrent = currentStep === stepIdx;

              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => {
                    soundManager.playBlip();
                    setCurrentStep(stepIdx);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-retro transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#F6D778] text-[#211A36] font-bold shadow-xs'
                      : isAnswered
                      ? 'bg-[#47336e] text-[#6ee7b7]'
                      : 'bg-[#1e1333] text-[#F4D9F0]/50 hover:bg-[#342452]'
                  }`}
                >
                  第 {stepIdx + 1} 題 {isAnswered && '✓'}
                </button>
              );
            })}

            <button
              type="button"
              disabled={selectedAnswers.includes(-1)}
              onClick={() => {
                soundManager.playCoin();
                setCurrentStep(5);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-retro transition-colors cursor-pointer ${
                currentStep === 5
                  ? 'bg-[#F6D778] text-[#211A36] font-bold'
                  : selectedAnswers.includes(-1)
                  ? 'opacity-40 cursor-not-allowed bg-[#1e1333] text-[#F4D9F0]/40'
                  : 'bg-[#8B65C7] text-white hover:bg-[#9d71e8]'
              }`}
            >
              判斷卡 📊
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {currentStep < 5 ? (
            /* Question Step */
            <div className="space-y-4">
              {/* Question Progress Bar */}
              <div className="w-full h-2 bg-[#170e28] rounded-xs overflow-hidden border border-[#524177]">
                <div
                  className="h-full bg-gradient-to-r from-[#8B65C7] to-[#F6D778] transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
                />
              </div>

              {/* Question Content */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                  {QUESTIONS[currentStep].title}
                </h3>
                <p className="text-xs text-[#F4D9F0]/70 leading-relaxed font-sans">
                  {QUESTIONS[currentStep].description}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {QUESTIONS[currentStep].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentStep] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3.5 rounded border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#F6D778] bg-[#432d6f] text-white shadow-md'
                          : 'border-[#4c3973] bg-[#22163d] text-[#F4D9F0]/80 hover:bg-[#2c1d4e] hover:border-[#6f54a8]'
                      }`}
                    >
                      <span className="text-sm font-bold">{option.text}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#F6D778] bg-[#F6D778]' : 'border-white/30'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#21163b]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Step 5: Shopping Judgment Card */
            <div className="space-y-4 animate-fade-in">
              <div
                className={`p-4 rounded-lg border-2 ${
                  judgment.verdictType === 'caution_budget'
                    ? 'pixel-box bg-[#381f2a] border-red-400'
                    : judgment.verdictType === 'extend_cooling'
                    ? 'pixel-box-gold bg-[#3d2e5e] border-[#F6D778]'
                    : judgment.verdictType === 'rethink_substitute'
                    ? 'pixel-box bg-[#2a2c42] border-[#818cf8]'
                    : 'pixel-box-green bg-[#1f332a] border-[#6ee7b7]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {judgment.verdictType === 'rethink_substitute' && (
                    <Sparkles className="w-5 h-5 text-[#818cf8]" />
                  )}
                  {judgment.verdictType === 'green_light' && (
                    <ShieldCheck className="w-5 h-5 text-[#6ee7b7]" />
                  )}
                  <h3 className="font-bold text-base text-white">
                    {judgment.verdictTitle}
                  </h3>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-white/10 text-xs text-[#F4D9F0] font-sans leading-relaxed">
                  {judgment.adviceList.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#F6D778] font-bold">▸</span>
                      <p>{adv}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answers Review */}
              <div className="bg-[#1c1330] p-3.5 rounded border border-[#433269] space-y-2">
                <span className="text-xs text-[#F6D778] font-bold block mb-1">
                  📋 你的思考軌跡：
                </span>
                {QUESTIONS.map((q, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] flex items-center justify-between border-b border-white/5 pb-1 gap-2"
                  >
                    <span className="text-[#F4D9F0]/70 truncate flex-1">{q.title}</span>
                    <span className="text-[#F6D778] font-bold shrink-0">
                      {q.options[selectedAnswers[idx]]?.text || '未回答'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-[#21163b] border-t border-[#4d3a77] flex items-center justify-between">
          {currentStep < 5 ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-3.5 py-1.5 rounded text-xs text-[#F4D9F0]/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>上一題</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={selectedAnswers[currentStep] === -1}
                className={`pixel-btn px-4 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer ${
                  currentStep === 4
                    ? 'bg-[#F6D778] hover:bg-[#ffe38f] text-[#211A36]'
                    : 'bg-[#8B65C7] hover:bg-[#9d71e8] text-white'
                }`}
              >
                <span>{currentStep === 4 ? '⚡ 產生購物判斷卡' : '下一題'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            /* Action Buttons on Result Card: 回到任務 / 再想一想 / 完成評估 */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs text-[#F4D9F0]/80 hover:text-white rounded border border-white/10 cursor-pointer"
              >
                回到任務
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeSelectedQuest && onExtendCooldown && (
                  <button
                    type="button"
                    onClick={handleRethinkExtend}
                    className="flex-1 sm:flex-none px-3.5 py-2 text-xs bg-[#402a63] hover:bg-[#4d3377] text-[#F6D778] border border-[#F6D778]/50 rounded cursor-pointer font-bold"
                  >
                    ⏳ 再想一想（為此商品延長3天）
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex-1 sm:flex-none pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-4 py-2 text-xs font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F6D778]" />
                  <span>完成評估 (+20 EXP)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
