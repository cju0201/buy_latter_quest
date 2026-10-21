import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  QuestItem,
  ActiveTab,
  ChronicleLog,
  Achievement,
  SoulEvaluationRecord,
  RelicItem,
  WeeklyChallengeWeekData,
  BudgetMode,
} from './types/quest';
import {
  loadStoredQuests,
  saveStoredQuests,
  loadStoredExp,
  saveStoredExp,
  loadStoredSound,
  saveStoredSound,
  loadStoredHourlyWage,
  saveStoredHourlyWage,
  loadStoredBudgetMode,
  saveStoredBudgetMode,
  loadStoredMonthlyAllowance,
  saveStoredMonthlyAllowance,
  loadStoredChronicle,
  saveStoredChronicle,
  loadStoredAchievements,
  saveStoredAchievements,
  loadStoredSoulEvaluations,
  saveStoredSoulEvaluations,
  loadStoredRelics,
  saveStoredRelics,
  loadStoredWeeklyChallengeData,
  saveStoredWeeklyChallengeData,
  exportBackupJSON,
} from './utils/storage';
import { calculateLevel, LevelInfo } from './utils/level';
import { soundManager } from './utils/sound';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { AdventurerHUD } from './components/AdventurerHUD';
import { QuestCard } from './components/QuestCard';
import { QuestCodex } from './components/QuestCodex';
import { RelicCodex } from './components/RelicCodex';
import { AchievementRoom } from './components/AchievementRoom';
import { AdventureChronicle } from './components/AdventureChronicle';
import { WeeklyChallengeCard } from './components/WeeklyChallengeCard';
import { NewQuestModal } from './components/NewQuestModal';
import { DecisionModal } from './components/DecisionModal';
import { SoulInterrogationModal } from './components/SoulInterrogationModal';
import { CelebrationToast } from './components/CelebrationToast';
import { ConfirmModal, ConfirmConfig } from './components/ConfirmModal';
import { Clock, Lightbulb, Shield, Brain, X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_COMPLETE_KEY = 'blq_feature_tour_completed_v1';
const TOUR_STEPS: { tab: ActiveTab; title: string; description: string; tip: string }[] = [
  { tab: 'lobby', title: '冒險大廳｜你的消費總覽', description: '這裡集中顯示冒險者等級、經驗值、守住的預算、進行中的任務和到期提醒。', tip: '點擊「登錄心動商品」建立第一筆冷靜任務。' },
  { tab: 'lobby', title: '建立任務｜先讓時間幫你冷靜', description: '輸入商品名稱、價格與冷靜期，也可以記下商品網址和當下想買的原因。', tip: '冷靜期可以依商品調整；任務建立後會出現在大廳與任務圖鑑。' },
  { tab: 'lobby', title: '任務倒數｜延長或做出決定', description: '任務卡會顯示冷靜倒數。時間到期後可重新評估，選擇放棄、購買或再延長冷靜期。', tip: '放棄可保住預算並獲得經驗值；確認購買也會留下理性決策紀錄。' },
  { tab: 'lobby', title: '每週挑戰｜把好習慣變成任務', description: '完成每週消費挑戰可領取經驗值；部分挑戰會由任務行動自動完成，生活實踐則可自行勾選。', tip: '每週挑戰全數完成後，還可領取額外全勤獎勵。' },
  { tab: 'lobby', title: '靈魂拷問室｜購買前的五題檢視', description: '針對商品回答五個問題，整理需求、預算與使用情境，產生購物判斷卡。', tip: '可從大廳直接開啟，也能在任務中針對商品進行評估。' },
  { tab: 'codex', title: '任務圖鑑｜管理所有商品紀錄', description: '查看、搜尋和篩選所有冷靜任務，進入任務細節、重新評估、延長或刪除紀錄。', tip: '到期任務會標示待重新評估，方便你回來做最後決定。' },
  { tab: 'relics', title: '聖物圖鑑｜查看解鎖收藏', description: '完成特定評估、任務或挑戰條件，就能解鎖聖物與對應經驗獎勵。', tip: '鎖定中的聖物會顯示解鎖條件。' },
  { tab: 'achievements', title: '成就室｜追蹤長期進度', description: '查看消費紀律的里程碑、目前進度與完成後的經驗獎勵。', tip: '成就進度會依任務、評估、守住預算和每週挑戰更新。' },
  { tab: 'chronicle', title: '冒險紀錄｜回顧與備份資料', description: '查看任務決策、經驗值與預算歷程；也可匯出備份或匯入先前的資料。', tip: '重設資料會清除本機紀錄，建議先匯出備份。' },
];

export default function App() {
  const [quests, setQuests] = useState<QuestItem[]>(() => loadStoredQuests());
  const [totalExp, setTotalExp] = useState<number>(() => loadStoredExp());
  const totalExpRef = React.useRef(totalExp);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadStoredSound());
  const [hourlyWage, setHourlyWage] = useState<number>(() => loadStoredHourlyWage());
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(() => loadStoredBudgetMode());
  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(() => loadStoredMonthlyAllowance());
  const [chronicle, setChronicle] = useState<ChronicleLog[]>(() => loadStoredChronicle());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStoredAchievements());

  // New Features States
  const [soulEvaluations, setSoulEvaluations] = useState<SoulEvaluationRecord[]>(() => loadStoredSoulEvaluations());
  const [relics, setRelics] = useState<RelicItem[]>(() => loadStoredRelics());
  const [weeklyData, setWeeklyData] = useState<{
    currentWeek: WeeklyChallengeWeekData;
    historyWeeks: WeeklyChallengeWeekData[];
  }>(() => loadStoredWeeklyChallengeData());

  const [activeTab, setActiveTab] = useState<ActiveTab>('lobby');
  const [isTourOpen, setIsTourOpen] = useState(() => localStorage.getItem(TOUR_COMPLETE_KEY) !== 'true');
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Modals
  const [isNewQuestOpen, setIsNewQuestOpen] = useState(false);
  const [decisionQuest, setDecisionQuest] = useState<QuestItem | null>(null);
  const [soulQuizQuest, setSoulQuizQuest] = useState<QuestItem | null>(null);
  const [isSoulQuizOpen, setIsSoulQuizOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [celebration, setCelebration] = useState<{
    title: string;
    subtitle: string;
    expGained?: number;
    icon?: string;
  } | null>(null);

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.enabled = soundEnabled;
    saveStoredSound(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isTourOpen) return;
    setActiveTab(TOUR_STEPS[tourStepIndex].tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isTourOpen, tourStepIndex]);

  // Timer loop for accurate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Level
  const levelInfo: LevelInfo = useMemo(() => calculateLevel(totalExp), [totalExp]);
  const prevLevelRef = React.useRef(levelInfo.level);

  // Check level-up
  useEffect(() => {
    if (levelInfo.level > prevLevelRef.current) {
      soundManager.playLevelUp();
      setCelebration({
        title: `等級提升！Lv.${levelInfo.level} ${levelInfo.title}`,
        subtitle: `你的自律心志已達全新境界，獲得公會新稱號！`,
        icon: '⭐',
      });
    }
    prevLevelRef.current = levelInfo.level;
  }, [levelInfo.level, levelInfo.title]);

  // Calculate Metrics from raw data (FR-06: strictly calculated without duplicates)
  const totalSaved = useMemo(() => {
    return quests
      .filter((q) => q.status === 'abandoned')
      .reduce((sum, q) => sum + q.price, 0);
  }, [quests]);

  const totalSpent = useMemo(() => {
    return quests
      .filter((q) => q.status === 'purchased')
      .reduce((sum, q) => sum + q.price, 0);
  }, [quests]);

  const activeQuests = useMemo(() => {
    return quests.filter((q) => {
      if (q.status === 'purchased' || q.status === 'abandoned') return false;
      return true;
    });
  }, [quests]);

  const reviewCount = useMemo(() => {
    return quests.filter((q) => {
      if (q.status === 'review') return true;
      if (q.status === 'waiting') {
        return new Date(q.deadline).getTime() <= nowMs;
      }
      return false;
    }).length;
  }, [quests, nowMs]);

  const activeCount = useMemo(() => {
    return quests.filter((q) => {
      if (q.status === 'waiting') {
        return new Date(q.deadline).getTime() > nowMs;
      }
      return false;
    }).length;
  }, [quests, nowMs]);

  const purchasedCount = useMemo(() => {
    return quests.filter((q) => q.status === 'purchased').length;
  }, [quests]);

  // Persist State Changes
  const updateQuests = useCallback((newQuests: QuestItem[]) => {
    setQuests(newQuests);
    saveStoredQuests(newQuests);
  }, []);

  const addExp = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    // Keep synchronous rewards (such as a relic and achievement unlocking
    // together) from overwriting one another before React re-renders.
    const next = totalExpRef.current + amount;
    totalExpRef.current = next;
    saveStoredExp(next);
    setTotalExp(next);
  }, []);

  const addChronicleLog = useCallback((log: Omit<ChronicleLog, 'id' | 'timestamp'>) => {
    const newEntry: ChronicleLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setChronicle((prev) => {
      const updated = [newEntry, ...prev];
      saveStoredChronicle(updated);
      return updated;
    });
  }, []);

  // Total claimed challenges counter
  const totalClaimedChallenges = useMemo(() => {
    const currentClaimed = weeklyData.currentWeek.challenges.filter((c) => c.isClaimed).length;
    const historyClaimed = weeklyData.historyWeeks.reduce(
      (sum, w) => sum + w.challenges.filter((c) => c.isClaimed).length,
      0
    );
    return currentClaimed + historyClaimed;
  }, [weeklyData]);

  // Check Relics Unlock Trigger (功能二: 冒險者圖鑑)
  const checkRelics = useCallback((
    currentQuests: QuestItem[],
    currentSaved: number,
    currentEvaluations: SoulEvaluationRecord[],
    currentAchs: Achievement[],
    claimedChallenges: number
  ) => {
    const completedCount = currentQuests.filter(q => q.status === 'abandoned' || q.status === 'purchased').length;
    const abandonedCount = currentQuests.filter(q => q.status === 'abandoned').length;
    const hasAbandoned = currentQuests.some(q => q.status === 'abandoned');
    const hasExpired = currentQuests.some(q => new Date(q.deadline).getTime() <= Date.now() || q.status === 'review' || q.status === 'abandoned' || q.status === 'purchased');
    const unlockedAchsCount = currentAchs.filter(a => a.isUnlocked).length;

    let expBonus = 0;
    const unlockedNow: RelicItem[] = [];
    const updated = relics.map((r) => {
        if (r.isUnlocked) return r;
        let shouldUnlock = false;

        if (r.id === 'relic-shield') {
          shouldUnlock = currentEvaluations.length >= 1 || completedCount >= 1;
        } else if (r.id === 'relic-hourglass') {
          shouldUnlock = hasExpired;
        } else if (r.id === 'relic-eye') {
          shouldUnlock = currentEvaluations.length >= 5;
        } else if (r.id === 'relic-coin-pouch') {
          shouldUnlock = hasAbandoned;
        } else if (r.id === 'relic-chronos-crystal') {
          shouldUnlock = completedCount >= 5;
        } else if (r.id === 'relic-vault-chest') {
          shouldUnlock = currentSaved >= 5000;
        } else if (r.id === 'relic-medal') {
          shouldUnlock = unlockedAchsCount >= 5;
        } else if (r.id === 'relic-star-stone') {
          shouldUnlock = claimedChallenges >= 2;
        } else if (r.id === 'relic-budget-compass') {
          shouldUnlock = currentQuests.length >= 10;
        } else if (r.id === 'relic-calm-orb') {
          shouldUnlock = currentEvaluations.length >= 10;
        } else if (r.id === 'relic-guardian-cape') {
          shouldUnlock = abandonedCount >= 5;
        }

        if (shouldUnlock) {
          expBonus += r.rewardExp;
          const unlocked = {
            ...r,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          };
          unlockedNow.push(unlocked);
          return unlocked;
        }
        return r;
      });

    if (!unlockedNow.length) return;
    setRelics(updated);
    saveStoredRelics(updated);
    addExp(expBonus);
    unlockedNow.forEach((r, index) => setTimeout(() => {
      soundManager.playCoin();
      setCelebration({
        title: `圖鑑解鎖！獲得聖物【${r.name}】`,
        subtitle: r.description,
        expGained: r.rewardExp,
        icon: r.iconSvg,
      });
    }, 350 + index * 350));
  }, [addExp, relics]);

  // Check Achievements Trigger (功能三: 12項成就解鎖)
  const checkAchievements = useCallback((
    updatedQuests: QuestItem[],
    currentSaved: number,
    currentEvaluations: SoulEvaluationRecord[],
    claimedChallenges: number,
    currentRelics: RelicItem[]
  ) => {
    const completedCount = updatedQuests.filter((q) => q.status === 'abandoned' || q.status === 'purchased').length;
    const abandonedCount = updatedQuests.filter((q) => q.status === 'abandoned').length;
    const hasExpired = updatedQuests.some(q => new Date(q.deadline).getTime() <= Date.now() || q.status === 'review' || q.status === 'abandoned' || q.status === 'purchased');
    const unlockedRelicsCount = currentRelics.filter((r) => r.isUnlocked).length;

    // Check consecutive weeks
    const hasConsecutive =
      weeklyData.historyWeeks.length >= 1 &&
      weeklyData.currentWeek.challenges.some((c) => c.isCompleted) &&
      weeklyData.historyWeeks[0]?.challenges.some((c) => c.isCompleted);

    let expToAdd = 0;
    const unlockedNow: Achievement[] = [];
    const currentUnlockedCount = achievements.filter((a) => a.isUnlocked).length;

    const updated = achievements.map((ach) => {
        let newProgress = ach.progress;
        let unlocked = ach.isUnlocked;

        if (ach.id === 'first_quest') {
          newProgress = Math.min(1, updatedQuests.length);
        } else if (ach.id === 'first_soul_quiz') {
          newProgress = Math.min(1, currentEvaluations.length);
        } else if (ach.id === 'patience_master') {
          newProgress = hasExpired ? 1 : 0;
        } else if (ach.id === 'rational_explorer') {
          newProgress = Math.min(5, currentEvaluations.length);
        } else if (ach.id === 'calm_veteran') {
          newProgress = Math.min(5, completedCount);
        } else if (ach.id === 'first_abandon') {
          newProgress = Math.min(1, abandonedCount);
        } else if (ach.id === 'save_1000') {
          newProgress = Math.min(1000, currentSaved);
        } else if (ach.id === 'save_5000') {
          newProgress = Math.min(5000, currentSaved);
        } else if (ach.id === 'challenge_novice') {
          newProgress = Math.min(1, claimedChallenges);
        } else if (ach.id === 'consecutive_challenger') {
          newProgress = hasConsecutive ? 2 : claimedChallenges >= 1 ? 1 : 0;
        } else if (ach.id === 'collector') {
          newProgress = Math.min(5, unlockedRelicsCount);
        } else if (ach.id === 'legend_hero') {
          newProgress = Math.min(10, currentUnlockedCount);
        } else if (ach.id === 'quest_planner') {
          newProgress = Math.min(10, updatedQuests.length);
        } else if (ach.id === 'mindful_evaluator') {
          newProgress = Math.min(10, currentEvaluations.length);
        } else if (ach.id === 'budget_guardian') {
          newProgress = Math.min(5, abandonedCount);
        } else if (ach.id === 'save_10000') {
          newProgress = Math.min(10000, currentSaved);
        }

        if (!unlocked && newProgress >= ach.maxProgress) {
          unlocked = true;
          expToAdd += ach.rewardExp;
        }

        const updatedAchievement = {
          ...ach,
          progress: newProgress,
          isUnlocked: unlocked,
          unlockedAt: unlocked && !ach.unlockedAt ? new Date().toISOString() : ach.unlockedAt,
        };
        if (!ach.isUnlocked && unlocked) unlockedNow.push(updatedAchievement);
        return updatedAchievement;
      });

    const hasProgressChange = updated.some((achievement, index) =>
      achievement.progress !== achievements[index]?.progress || achievement.isUnlocked !== achievements[index]?.isUnlocked
    );
    if (!hasProgressChange) return;
    setAchievements(updated);
    saveStoredAchievements(updated);
    if (expToAdd > 0) addExp(expToAdd);
    unlockedNow.forEach((achievement, index) => setTimeout(() => {
      soundManager.playCoin();
      setCelebration({
        title: `成就解鎖！【${achievement.title}】`,
        subtitle: achievement.description,
        expGained: achievement.rewardExp,
        icon: achievement.icon,
      });
    }, 450 + index * 450));
  }, [addExp, weeklyData, achievements]);

  // Hook for full progress checks
  const triggerGlobalProgressCheck = useCallback((
    updatedQuests: QuestItem[] = quests,
    updatedSaved: number = totalSaved,
    updatedEvaluations: SoulEvaluationRecord[] = soulEvaluations,
    updatedClaimedChallenges: number = totalClaimedChallenges
  ) => {
    checkRelics(updatedQuests, updatedSaved, updatedEvaluations, achievements, updatedClaimedChallenges);
    checkAchievements(updatedQuests, updatedSaved, updatedEvaluations, updatedClaimedChallenges, relics);
  }, [quests, totalSaved, soulEvaluations, totalClaimedChallenges, achievements, relics, checkRelics, checkAchievements]);

  // Initial check on mount
  useEffect(() => {
    triggerGlobalProgressCheck();
  }, []);

  // Update Weekly Challenges by Action Type
  const notifyChallengeAction = useCallback((actionType: 'auto_evaluation' | 'auto_decision' | 'auto_quest' | 'auto_abandon') => {
    setWeeklyData((prev) => {
      let modified = false;
      const updatedChallenges = prev.currentWeek.challenges.map((c) => {
        if (c.verificationType === actionType && !c.isCompleted) {
          modified = true;
          return {
            ...c,
            currentCount: 1,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      if (!modified) return prev;

      const nextWeek = {
        ...prev.currentWeek,
        challenges: updatedChallenges,
        isAllCompleted: updatedChallenges.every((c) => c.isCompleted),
      };

      saveStoredWeeklyChallengeData(nextWeek, prev.historyWeeks);
      return {
        ...prev,
        currentWeek: nextWeek,
      };
    });
  }, []);

  // FR-01: Create Quest
  const handleCreateQuest = (data: {
    name: string;
    price: number;
    cooldownHours: number;
    category: QuestItem['category'];
    url?: string;
    note?: string;
  }) => {
    const now = new Date();
    const deadline = new Date(now.getTime() + data.cooldownHours * 3600 * 1000);

    const newQuest: QuestItem = {
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: data.name,
      price: data.price,
      cooldownHours: data.cooldownHours,
      initialHours: data.cooldownHours,
      category: data.category,
      url: data.url,
      note: data.note,
      createdAt: now.toISOString(),
      deadline: deadline.toISOString(),
      status: 'waiting',
      extensionCount: 0,
    };

    const nextQuests = [newQuest, ...quests];
    updateQuests(nextQuests);
    addExp(5);
    addChronicleLog({
      questId: newQuest.id,
      questName: `接下新任務：${newQuest.name}`,
      type: 'created',
      amount: newQuest.price,
      expGained: 5,
      note: newQuest.note || `設定 ${data.cooldownHours >= 24 ? data.cooldownHours / 24 + '天' : data.cooldownHours + '小時'} 冷靜期`,
    });

    notifyChallengeAction('auto_quest');
    triggerGlobalProgressCheck(nextQuests, totalSaved, soulEvaluations, totalClaimedChallenges);
  };

  // FR-05: Decision Handling
  const handleDecision = (
    questId: string,
    decision: 'abandoned' | 'purchased' | 'extended',
    options?: { extendHours?: number; userReflection?: string }
  ) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;

    const now = new Date();

    if (decision === 'abandoned') {
      const expGained = 25;
      const nextQuests = quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: 'abandoned' as const,
              decisionAt: now.toISOString(),
              decision: 'abandoned' as const,
            }
          : q
      );

      updateQuests(nextQuests);
      addExp(expGained);
      const newSaved = totalSaved + target.price;

      addChronicleLog({
        questId: target.id,
        questName: `理智勝利！放棄購買「${target.name}」`,
        type: 'abandoned',
        amount: target.price,
        expGained,
        note: options?.userReflection || '熱情退卻，成功保住預算！',
      });

      setCelebration({
        title: '🛡️ 守護荷包成功！',
        subtitle: `成功放棄「${target.name}」，保住 NT$ ${target.price.toLocaleString()}！`,
        expGained,
        icon: '🪙',
      });

      notifyChallengeAction('auto_decision');
      notifyChallengeAction('auto_abandon');
      triggerGlobalProgressCheck(nextQuests, newSaved, soulEvaluations, totalClaimedChallenges);
    } else if (decision === 'purchased') {
      const expGained = 25;
      const nextQuests = quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: 'purchased' as const,
              decisionAt: now.toISOString(),
              decision: 'purchased' as const,
            }
          : q
      );

      updateQuests(nextQuests);
      addExp(expGained);

      addChronicleLog({
        questId: target.id,
        questName: `深思熟慮！確認購買「${target.name}」`,
        type: 'purchased',
        amount: target.price,
        expGained,
        note: options?.userReflection || '經過冷靜等待，確認為真正所需。',
      });

      notifyChallengeAction('auto_decision');
      triggerGlobalProgressCheck(nextQuests, totalSaved, soulEvaluations, totalClaimedChallenges);
    } else if (decision === 'extended') {
      const extendHours = options?.extendHours || 72;
      const expGained = 10;
      const currentDeadline = new Date(target.deadline).getTime();
      const baseTime = currentDeadline < now.getTime() ? now.getTime() : currentDeadline;
      const newDeadline = new Date(baseTime + extendHours * 3600 * 1000);

      const nextQuests = quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: 'waiting' as const,
              deadline: newDeadline.toISOString(),
              extensionCount: (q.extensionCount || 0) + 1,
              decision: 'extended' as const,
            }
          : q
      );

      updateQuests(nextQuests);
      addExp(expGained);

      addChronicleLog({
        questId: target.id,
        questName: `延長冷靜期：${target.name} (+${extendHours / 24}天)`,
        type: 'extended',
        amount: target.price,
        expGained,
        note: options?.userReflection || '多給自己一些時間仔細思考。',
      });

      notifyChallengeAction('auto_decision');
      triggerGlobalProgressCheck(nextQuests, totalSaved, soulEvaluations, totalClaimedChallenges);
    }
  };

  // Quick Action: Early abandon
  const handleQuickAbandon = (quest: QuestItem) => {
    soundManager.playBlip();
    setConfirmConfig({
      title: '🛡️ 提前放棄・保住預算',
      message: `確定要提前放棄「${quest.name}」嗎？\n\n理智勝利！這將直接為你保住 NT$ ${quest.price.toLocaleString()} 的預算，並獲得 +25 EXP 經驗值獎勵。`,
      confirmText: '確定放棄・保住預算 (+25 EXP)',
      cancelText: '我再想想',
      variant: 'success',
      icon: 'shield',
      onConfirm: () => {
        handleDecision(quest.id, 'abandoned', {
          userReflection: '在冷靜期中提早看清心意，直接放棄購買！',
        });
      },
    });
  };

  // Quick Action: Extend Cooldown
  const handleQuickExtend = (quest: QuestItem, hours: number) => {
    soundManager.playBlip();
    handleDecision(quest.id, 'extended', {
      extendHours: hours,
      userReflection: `快速延長冷靜期 ${hours >= 24 ? hours / 24 + '天' : hours + '小時'}`,
    });
  };

  // Delete Quest
  const handleDeleteQuest = (questId: string) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;
    soundManager.playBlip();
    setConfirmConfig({
      title: '🗑️ 移除此任務',
      message: `確定要刪除「${target.name}」任務嗎？此動作將移除這筆紀錄。`,
      confirmText: '確定刪除',
      cancelText: '取消',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        const nextQuests = quests.filter((q) => q.id !== questId);
        updateQuests(nextQuests);
      },
    });
  };

  // Feature 1: Complete Soul Evaluation
  const handleCompleteSoulEvaluation = (record: SoulEvaluationRecord) => {
    const evaluationKey = (itemName: string, itemPrice: number) => `${itemName.trim().toLocaleLowerCase()}::${itemPrice}`;
    const alreadyRewarded = soulEvaluations.some((existing) =>
      record.questId
        ? existing.questId === record.questId
        : !existing.questId && evaluationKey(existing.itemName, existing.itemPrice) === evaluationKey(record.itemName, record.itemPrice)
    );
    const updatedEvaluations = [record, ...soulEvaluations];
    setSoulEvaluations(updatedEvaluations);
    saveStoredSoulEvaluations(updatedEvaluations);

    const expGained = alreadyRewarded ? 0 : 10;
    if (expGained > 0) addExp(expGained);

    addChronicleLog({
      questId: record.questId,
      questName: `完成購物靈魂拷問：${record.itemName}`,
      type: 'evaluation',
      amount: record.itemPrice,
      expGained,
      note: record.verdictTitle,
    });

    setCelebration({
      title: '🧠 靈魂問答評估完成！',
      subtitle: alreadyRewarded
        ? `已再次完成「${record.verdictTitle.slice(0, 15)}...」評估，本商品不重複發放經驗值`
        : `獲得「${record.verdictTitle.slice(0, 15)}...」購物判斷卡`,
      expGained,
      icon: '🔮',
    });

    notifyChallengeAction('auto_evaluation');
    triggerGlobalProgressCheck(quests, totalSaved, updatedEvaluations, totalClaimedChallenges);
  };

  // Feature 5: Weekly Challenge Actions
  const handleClaimChallengeReward = (challengeId: string) => {
    const challenge = weeklyData.currentWeek.challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.isClaimed) return;

    const updatedChallenges = weeklyData.currentWeek.challenges.map((c) => {
      if (c.id === challengeId) {
        return { ...c, isClaimed: true };
      }
      return c;
    });

    const nextWeek = {
      ...weeklyData.currentWeek,
      challenges: updatedChallenges,
    };

    setWeeklyData((prev) => ({
      ...prev,
      currentWeek: nextWeek,
    }));
    saveStoredWeeklyChallengeData(nextWeek, weeklyData.historyWeeks);

    addExp(challenge.rewardExp);
    addChronicleLog({
      questName: `達成每週挑戰：${challenge.title}`,
      type: 'challenge',
      expGained: challenge.rewardExp,
      note: `成功領取週任務獎勵 +${challenge.rewardExp} EXP`,
    });

    const newClaimedCount = totalClaimedChallenges + 1;
    triggerGlobalProgressCheck(quests, totalSaved, soulEvaluations, newClaimedCount);
  };

  const handleManualSelfCheck = (challengeId: string) => {
    const challenge = weeklyData.currentWeek.challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    setConfirmConfig({
      title: '🎯 確認完成生活實踐',
      message: `你已確認完成了【${challenge.title}】的實踐行動嗎？\n\n「${challenge.description}」`,
      confirmText: '確定已實踐完成',
      cancelText: '取消',
      variant: 'success',
      icon: 'shield',
      onConfirm: () => {
        soundManager.playCoin();
        const updatedChallenges = weeklyData.currentWeek.challenges.map((c) => {
          if (c.id === challengeId) {
            return {
              ...c,
              currentCount: 1,
              isCompleted: true,
              completedAt: new Date().toISOString(),
            };
          }
          return c;
        });

        const nextWeek = {
          ...weeklyData.currentWeek,
          challenges: updatedChallenges,
          isAllCompleted: updatedChallenges.every((c) => c.isCompleted),
        };

        setWeeklyData((prev) => ({ ...prev, currentWeek: nextWeek }));
        saveStoredWeeklyChallengeData(nextWeek, weeklyData.historyWeeks);
      },
    });
  };

  const handleClaimAllWeeklyBonus = () => {
    if (weeklyData.currentWeek.hasClaimedWeeklyBonus) return;
    const bonusExp = 50;

    const nextWeek = {
      ...weeklyData.currentWeek,
      hasClaimedWeeklyBonus: true,
    };

    setWeeklyData((prev) => ({ ...prev, currentWeek: nextWeek }));
    saveStoredWeeklyChallengeData(nextWeek, weeklyData.historyWeeks);

    addExp(bonusExp);
    addChronicleLog({
      questName: `本週消費挑戰全滿貫榮譽！`,
      type: 'challenge',
      expGained: bonusExp,
      note: `順利完成當週 3 項自律任務，獲得公會全勤獎盃`,
    });

    setCelebration({
      title: '🏆 本週全挑戰大滿貫！',
      subtitle: '恭喜完成本週全部消費修煉挑戰，獲頒週全勤榮譽！',
      expGained: bonusExp,
      icon: '👑',
    });
  };

  // Hourly wage update
  const handleUpdateWage = (newWage: number) => {
    setHourlyWage(newWage);
    saveStoredHourlyWage(newWage);
  };

  const handleSaveBudgetSettings = (mode: BudgetMode, amount: number) => {
    setBudgetMode(mode);
    saveStoredBudgetMode(mode);
    if (mode === 'hourly') handleUpdateWage(amount);
    else {
      setMonthlyAllowance(amount);
      saveStoredMonthlyAllowance(amount);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const jsonStr = exportBackupJSON(quests, totalExp, chronicle, soulEvaluations, relics);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buy-later-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.quests && Array.isArray(parsed.quests)) {
          updateQuests(parsed.quests);
          if (typeof parsed.exp === 'number' && Number.isFinite(parsed.exp) && parsed.exp >= 0) {
            totalExpRef.current = parsed.exp;
            setTotalExp(parsed.exp);
            saveStoredExp(parsed.exp);
          }
          if (parsed.chronicle && Array.isArray(parsed.chronicle)) {
            setChronicle(parsed.chronicle);
            saveStoredChronicle(parsed.chronicle);
          }
          if (parsed.evaluations && Array.isArray(parsed.evaluations)) {
            setSoulEvaluations(parsed.evaluations);
            saveStoredSoulEvaluations(parsed.evaluations);
          }
          if (parsed.relics && Array.isArray(parsed.relics)) {
            setRelics(parsed.relics);
            saveStoredRelics(parsed.relics);
          }
          soundManager.playCoin();
          setCelebration({
            title: '資料備份匯入成功！',
            subtitle: '已成功還原所有冷靜期任務、聖物圖鑑與冒險紀錄。',
            icon: '📦',
          });
        } else {
          setCelebration({
            title: '匯入失敗',
            subtitle: '所選檔案格式不正確，請確認是 BUY LATER QUEST 備份檔。',
            icon: '⚠️',
          });
        }
      } catch {
        setCelebration({
          title: '解析失敗',
          subtitle: '讀取備份檔案失敗，請檢查檔案是否損毀。',
          icon: '⚠️',
        });
      }
    };
    reader.readAsText(file);
  };

  // Reset all local progress to a clean, empty state.
  const handleResetData = () => {
    soundManager.playBlip();
    setConfirmConfig({
      title: '🔄 清空所有紀錄',
      message: '確定要清空所有冷靜任務、經驗值與冒險紀錄嗎？此操作無法復原。',
      confirmText: '確定清空',
      cancelText: '取消',
      variant: 'warning',
      icon: 'reset',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      },
    });
  };

  // Open Soul Quiz directly
  const handleOpenSoulQuizModal = (targetQuest?: QuestItem | null) => {
    soundManager.playBlip();
    setSoulQuizQuest(targetQuest || null);
    setIsSoulQuizOpen(true);
  };

  const handleOpenTour = () => {
    setTourStepIndex(0);
    setActiveTab('lobby');
    setIsTourOpen(true);
  };

  const finishTour = () => {
    localStorage.setItem(TOUR_COMPLETE_KEY, 'true');
    setIsTourOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#211A36] text-[#F4D9F0] flex flex-col font-sans selection:bg-[#8B65C7] selection:text-white pb-24 md:pb-12 pixel-grid-pattern">
      {/* Top Bar Header with BGM, sound toggle & navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={reviewCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenTour={handleOpenTour}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Render Tab Contents */}
        {activeTab === 'lobby' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Adventurer RPG HUD & KPIs */}
            <AdventurerHUD
              levelInfo={levelInfo}
              totalExp={totalExp}
              totalSaved={totalSaved}
              activeCount={activeCount}
              reviewCount={reviewCount}
              purchasedCount={purchasedCount}
              wagePerHour={hourlyWage}
              budgetMode={budgetMode}
              monthlyAllowance={monthlyAllowance}
              onSaveBudgetSettings={handleSaveBudgetSettings}
              onOpenNewQuest={() => setIsNewQuestOpen(true)}
              onOpenReviewFilter={() => {
                setActiveTab('codex');
              }}
            />

            {/* Feature 5: Weekly Challenge Card (每週消費挑戰) */}
            <WeeklyChallengeCard
              weekData={weeklyData.currentWeek}
              onClaimReward={handleClaimChallengeReward}
              onManualSelfCheck={handleManualSelfCheck}
              onClaimAllBonus={handleClaimAllWeeklyBonus}
            />

            {/* Review Callout Banner if items expired */}
            {reviewCount > 0 && (
              <div className="p-4 rounded-lg pixel-box-gold bg-[#3d2a63] border-2 border-[#F6D778] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#523984] text-[#F6D778] rounded-md shrink-0 border border-[#F6D778]">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-retro font-bold text-sm sm:text-base text-[#F6D778]">
                      ⚡ 有 {reviewCount} 件商品冷靜期已結束！
                    </h3>
                    <p className="text-xs text-[#F4D9F0]/90 font-retro mt-0.5">
                      當初的心動火焰還在燃燒嗎？現在正是重新評估的最佳時刻。
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('codex')}
                    className="pixel-btn bg-[#F6D778] hover:bg-[#ffe38f] text-[#211A36] text-xs font-bold px-4 py-2 rounded shrink-0 cursor-pointer"
                  >
                    前往重新評估
                  </button>
                </div>
              </div>
            )}

            {/* Quick Standalone Soul Interrogation Banner */}
            <div className="p-4 rounded-lg pixel-box bg-[#2a1d47] border border-[#6d51a6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#3a2663] text-[#F6D778] rounded-md shrink-0 border border-[#8B65C7]">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-retro font-bold text-sm text-white flex items-center gap-2">
                    <span>購物靈魂拷問室 · 隨時開啟客觀檢驗</span>
                    <span className="text-[10px] bg-[#8B65C7] text-white px-1.5 py-0.2 rounded font-pixel">互動5題</span>
                  </h3>
                  <p className="text-xs text-[#F4D9F0]/75 font-sans mt-0.5">
                    看中任何商品？即使尚未登錄任務，也能立刻進入 5 題靈魂叩問，獲得客觀「購物判斷卡」！
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenSoulQuizModal(null)}
                className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white text-xs font-bold px-4 py-2 rounded shrink-0 cursor-pointer whitespace-nowrap"
              >
                開啟拷問室 (+20 EXP)
              </button>
            </div>

            {/* Today's Active Quests Section (PRD Section 5.2.D) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#F6D778]" />
                  <h2 className="text-lg sm:text-xl font-bold font-retro text-white">
                    今日進行中任務 · Active Quests
                  </h2>
                  <span className="text-xs font-mono text-[#F4D9F0]/60">
                    ({activeQuests.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('codex')}
                  className="text-xs text-[#a481de] hover:text-[#F6D778] font-retro flex items-center gap-1 cursor-pointer"
                >
                  <span>查看全部圖鑑</span>
                  <span>→</span>
                </button>
              </div>

              {activeQuests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      nowMs={nowMs}
                      onOpenDecision={(q) => setDecisionQuest(q)}
                      onQuickAbandon={handleQuickAbandon}
                      onQuickExtend={handleQuickExtend}
                      onDeleteQuest={handleDeleteQuest}
                      onOpenSoulQuiz={(q) => handleOpenSoulQuizModal(q)}
                      wagePerHour={hourlyWage}
                      budgetMode={budgetMode}
                      monthlyAllowance={monthlyAllowance}
                    />
                  ))}
                </div>
              ) : (
                /* Empty Lobby State */
                <div className="text-center py-12 px-4 bg-[#30254D]/60 border-2 border-dashed border-[#503e7a] rounded-lg pixel-box">
                  <div className="text-4xl mb-3">🛡️</div>
                  <h3 className="font-retro text-base sm:text-lg text-white font-bold mb-1">
                    公會任務板上暫無進行中的冷靜任務
                  </h3>
                  <p className="text-xs text-[#F4D9F0]/70 max-w-md mx-auto mb-4 font-retro">
                    看到喜歡的商品時，先別急著刷卡結帳！將它登錄為冷靜期任務，讓時間幫你過濾一時衝動。
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsNewQuestOpen(true)}
                    className="pixel-btn bg-[#8B65C7] hover:bg-[#9d71e8] text-white px-4 py-2 text-xs font-bold rounded inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>登錄心動商品</span>
                  </button>
                </div>
              )}
            </div>

            {/* Rational Adventurer Tips & Creed */}
            <div className="p-4 sm:p-5 rounded-lg pixel-box bg-[#2a1f45] border border-[#4d3a77] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#F6D778] font-retro font-bold text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>公會心動防禦秘笈：10/10/10 法則</span>
                </div>
                <p className="text-xs text-[#F4D9F0]/80 leading-relaxed font-retro">
                  遇到強烈心動的商品時，問自己三個問題：<strong>10分鐘後</strong>我還想買嗎？<strong>10天後</strong>我還會常用嗎？<strong>10個月後</strong>它會成為房間的雜物還是真正的寶藏？
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#6ee7b7] font-retro font-bold text-xs sm:text-sm">
                  <Shield className="w-4 h-4" />
                  <span>公會核心信條：不是禁止購物，而是理性決策</span>
                </div>
                <p className="text-xs text-[#F4D9F0]/80 leading-relaxed font-retro">
                  買下真正需要且帶來長久幸福感的物品是冒險者的權利；每一次經過冷靜期後做出的決定，無論是買或不買，都是值得讚許的成熟表現！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Tasks Codex (任務圖鑑) */}
        {activeTab === 'codex' && (
          <QuestCodex
            quests={quests}
            nowMs={nowMs}
            onOpenDecision={(q) => setDecisionQuest(q)}
            onQuickAbandon={handleQuickAbandon}
            onQuickExtend={handleQuickExtend}
            onDeleteQuest={handleDeleteQuest}
            onOpenNewQuest={() => setIsNewQuestOpen(true)}
            onOpenSoulQuiz={(q) => handleOpenSoulQuizModal(q)}
            wagePerHour={hourlyWage}
            budgetMode={budgetMode}
            monthlyAllowance={monthlyAllowance}
          />
        )}

        {/* Tab: Relics Codex (功能二: 冒險者圖鑑) */}
        {activeTab === 'relics' && (
          <RelicCodex relics={relics} />
        )}

        {/* Tab: Achievements (功能三: 成就室) */}
        {activeTab === 'achievements' && (
          <AchievementRoom
            achievements={achievements}
            totalExp={totalExp}
          />
        )}

        {/* Tab: Chronicle (冒險紀錄) */}
        {activeTab === 'chronicle' && (
          <AdventureChronicle
            logs={chronicle}
            quests={quests}
            totalSaved={totalSaved}
            totalSpent={totalSpent}
            totalExp={totalExp}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-4 text-center text-xs text-[#F4D9F0]/40 font-retro">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#342754] pt-4">
          <p>BUY LATER QUEST 購物冷靜期 · 16-bit 衝動購物管理公會</p>
          <p className="text-[11px]">本機資料保存於瀏覽器 · 支援 GitHub Pages 部署</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={reviewCount}
      />

      {isTourOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
          <section className="w-full max-w-2xl rounded-lg pixel-box-gold bg-[#30254D]/95 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#251b3d] border-b border-[#4d3a77]">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center justify-between gap-3 text-[10px] text-[#F6D778] font-pixel">
                  <span>GUILD GUIDE</span>
                  <span>{tourStepIndex + 1} / {TOUR_STEPS.length}</span>
                </div>
                <div className="mt-2 h-1.5 rounded bg-[#171125] overflow-hidden">
                  <div className="h-full bg-[#F6D778] transition-all" style={{ width: `${((tourStepIndex + 1) / TOUR_STEPS.length) * 100}%` }} />
                </div>
              </div>
              <button type="button" onClick={finishTour} aria-label="略過導覽" title="略過導覽" className="p-2 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <p className="text-[10px] text-[#F6D778] font-pixel">{TOUR_STEPS[tourStepIndex].tab === 'lobby' ? 'ADVENTURE LOBBY' : TOUR_STEPS[tourStepIndex].tab.toUpperCase()}</p>
              <h2 id="tour-title" className="mt-1 text-base sm:text-lg text-white font-retro font-bold">{TOUR_STEPS[tourStepIndex].title}</h2>
              <p className="mt-2 text-sm text-[#F4D9F0]/90 leading-relaxed">{TOUR_STEPS[tourStepIndex].description}</p>
              <p className="mt-2 text-xs text-[#F6D778] leading-relaxed">{TOUR_STEPS[tourStepIndex].tip}</p>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-[#4d3a77] bg-[#251b3d]">
              <button type="button" onClick={finishTour} className="text-xs text-[#F4D9F0]/70 hover:text-white underline underline-offset-4">略過導覽</button>
              <div className="flex items-center gap-2">
                {tourStepIndex > 0 && (
                  <button type="button" onClick={() => setTourStepIndex((step) => step - 1)} className="pixel-btn bg-[#47346b] text-white px-3 py-2 text-xs rounded inline-flex items-center gap-1"><ChevronLeft className="w-4 h-4" />上一步</button>
                )}
                {tourStepIndex < TOUR_STEPS.length - 1 ? (
                  <button type="button" onClick={() => setTourStepIndex((step) => step + 1)} className="pixel-btn bg-[#8B65C7] text-white px-3 py-2 text-xs rounded inline-flex items-center gap-1">下一步<ChevronRight className="w-4 h-4" /></button>
                ) : (
                  <button type="button" onClick={finishTour} className="pixel-btn bg-[#F6D778] text-[#211A36] px-3 py-2 text-xs font-bold rounded">完成導覽</button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Feature 1: Soul Interrogation Modal (購物靈魂拷問室) */}
      <SoulInterrogationModal
        isOpen={isSoulQuizOpen}
        onClose={() => setIsSoulQuizOpen(false)}
        quest={soulQuizQuest}
        allQuests={quests}
        onCompleteEvaluation={handleCompleteSoulEvaluation}
        onExtendCooldown={(qid, hours) => {
          const target = quests.find(q => q.id === qid);
          if (target) handleQuickExtend(target, hours);
        }}
        wagePerHour={hourlyWage}
        budgetMode={budgetMode}
        monthlyAllowance={monthlyAllowance}
      />

      {/* New Quest Modal */}
      <NewQuestModal
        isOpen={isNewQuestOpen}
        onClose={() => setIsNewQuestOpen(false)}
        onSubmit={handleCreateQuest}
        wagePerHour={hourlyWage}
        budgetMode={budgetMode}
        monthlyAllowance={monthlyAllowance}
      />

      {/* Decision Modal */}
      <DecisionModal
        quest={decisionQuest}
        isOpen={!!decisionQuest}
        onClose={() => setDecisionQuest(null)}
        onConfirmDecision={handleDecision}
        onOpenSoulQuiz={(q) => handleOpenSoulQuizModal(q)}
        wagePerHour={hourlyWage}
        budgetMode={budgetMode}
        monthlyAllowance={monthlyAllowance}
      />

      {/* Level Up & Achievement Celebration Toast */}
      {celebration && (
        <CelebrationToast
          title={celebration.title}
          subtitle={celebration.subtitle}
          expGained={celebration.expGained}
          icon={celebration.icon}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* In-app Confirmation Modal (replaces browser confirm) */}
      <ConfirmModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </div>
  );
}
