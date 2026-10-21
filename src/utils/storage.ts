import {
  QuestItem,
  ChronicleLog,
  Achievement,
  SoulEvaluationRecord,
  RelicItem,
  WeeklyChallengeWeekData,
  ClaimedRewardRecord,
  BudgetMode,
} from '../types/quest';
import { INITIAL_ACHIEVEMENTS } from './level';
import { INITIAL_RELICS } from './relics';
import { getTaiwanWeekInfo, generateWeeklyChallengesForWeek } from './challenge';

const STORAGE_KEYS = {
  QUESTS: 'blq_quests_v1',
  EXP: 'blq_total_exp_v1',
  SOUND: 'blq_sound_v1',
  CHRONICLE: 'blq_chronicle_v1',
  ACHIEVEMENTS: 'blq_achievements_v1',
  HOURLY_WAGE: 'blq_hourly_wage_v1',
  BUDGET_MODE: 'blq_budget_mode_v1',
  MONTHLY_ALLOWANCE: 'blq_monthly_allowance_v1',
  SOUL_EVALUATIONS: 'blq_soul_evaluations_v1',
  RELICS: 'blq_relics_v1',
  WEEKLY_CHALLENGES: 'blq_weekly_challenges_v1',
  BGM: 'blq_bgm_settings_v1',
  CLAIMED_REWARDS: 'blq_claimed_rewards_v1',
};

export function loadStoredQuests(): QuestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTS);
    if (!raw) return [];
    const parsed: QuestItem[] = JSON.parse(raw);
    const now = Date.now();

    // Remove the two demo records seeded by older versions.
    const quests = parsed.filter(q => !q.id.startsWith('sample-')).map(q => {
      if (q.status === 'waiting') {
        const deadlineTime = new Date(q.deadline).getTime();
        if (deadlineTime <= now) {
          return { ...q, status: 'review' as const };
        }
      }
      return q;
    });
    if (quests.length !== parsed.length) saveStoredQuests(quests);
    return quests;
  } catch (e) {
    console.error('Error loading quests from localStorage', e);
    return [];
  }
}

export function saveStoredQuests(quests: QuestItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  } catch (e) {
    console.error('Error saving quests to localStorage', e);
  }
}

export function loadStoredExp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXP);
    if (raw === null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveStoredExp(exp: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXP, exp.toString());
  } catch (e) {
    console.error('Error saving exp', e);
  }
}

export function loadStoredSound(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND);
    return raw !== null ? raw === 'true' : true;
  } catch {
    return true;
  }
}

export function saveStoredSound(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, enabled.toString());
  } catch {
    // Ignore
  }
}

export function loadStoredHourlyWage(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOURLY_WAGE);
    return raw ? parseInt(raw, 10) || 196 : 196;
  } catch {
    return 196;
  }
}

export function saveStoredHourlyWage(wage: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOURLY_WAGE, wage.toString());
  } catch {
    // Ignore
  }
}

export function loadStoredBudgetMode(): BudgetMode {
  try {
    return localStorage.getItem(STORAGE_KEYS.BUDGET_MODE) === 'monthly_allowance'
      ? 'monthly_allowance'
      : 'hourly';
  } catch {
    return 'hourly';
  }
}

export function saveStoredBudgetMode(mode: BudgetMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET_MODE, mode);
  } catch {
    // Ignore
  }
}

export function loadStoredMonthlyAllowance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_ALLOWANCE);
    if (raw === null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveStoredMonthlyAllowance(amount: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_ALLOWANCE, amount.toString());
  } catch {
    // Ignore
  }
}

export function loadStoredChronicle(): ChronicleLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHRONICLE);
    if (!raw) return [];
    const logs: ChronicleLog[] = JSON.parse(raw);
    const cleaned = logs.filter(log => log.id !== 'log-welcome');
    if (cleaned.length !== logs.length) saveStoredChronicle(cleaned);
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredChronicle(logs: ChronicleLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHRONICLE, JSON.stringify(logs.slice(0, 100)));
  } catch {
    // Ignore
  }
}

export function loadStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) {
      return INITIAL_ACHIEVEMENTS;
    }
    const saved: Achievement[] = JSON.parse(raw);
    return INITIAL_ACHIEVEMENTS.map(initial => {
      const existing = saved.find(s => s.id === initial.id);
      if (existing) {
        return {
          ...initial,
          ...existing,
          // 若舊資料中已經解鎖過，預設為已發放，防止重新發放造成重複灌水
          isClaimed: existing.isClaimed ?? (existing.isUnlocked ? true : false),
        };
      }
      return initial;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveStoredAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch {
    // Ignore
  }
}

// 1. Soul Evaluation Records
export function loadStoredSoulEvaluations(): SoulEvaluationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUL_EVALUATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSoulEvaluations(records: SoulEvaluationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUL_EVALUATIONS, JSON.stringify(records));
  } catch {
    // Ignore
  }
}

// 2. Relics Codex Records
export function loadStoredRelics(): RelicItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RELICS);
    if (!raw) {
      return INITIAL_RELICS;
    }
    const saved: RelicItem[] = JSON.parse(raw);
    return INITIAL_RELICS.map(initial => {
      const existing = saved.find(r => r.id === initial.id);
      if (existing) {
        return {
          ...initial,
          ...existing,
          // 若舊資料中已經解鎖過，預設為已發放，防止重複灌水
          isClaimed: existing.isClaimed ?? (existing.isUnlocked ? true : false),
        };
      }
      return initial;
    });
  } catch {
    return INITIAL_RELICS;
  }
}

export function saveStoredRelics(relics: RelicItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RELICS, JSON.stringify(relics));
  } catch {
    // Ignore
  }
}

// 3. Weekly Challenges State
export function loadStoredWeeklyChallengeData(): {
  currentWeek: WeeklyChallengeWeekData;
  historyWeeks: WeeklyChallengeWeekData[];
} {
  const currentWeekInfo = getTaiwanWeekInfo();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_CHALLENGES);
    if (!raw) {
      const newWeek: WeeklyChallengeWeekData = {
        weekKey: currentWeekInfo.weekKey,
        weekStart: currentWeekInfo.weekStartStr,
        weekEnd: currentWeekInfo.weekEndStr,
        challenges: generateWeeklyChallengesForWeek(currentWeekInfo.weekKey),
        isAllCompleted: false,
        hasClaimedWeeklyBonus: false,
      };
      saveStoredWeeklyChallengeData(newWeek, []);
      return { currentWeek: newWeek, historyWeeks: [] };
    }

    const parsed = JSON.parse(raw);
    const historyWeeks: WeeklyChallengeWeekData[] = Array.isArray(parsed.historyWeeks) ? parsed.historyWeeks : [];
    let currentWeek: WeeklyChallengeWeekData = parsed.currentWeek;

    // Check if week changed
    if (!currentWeek || currentWeek.weekKey !== currentWeekInfo.weekKey) {
      if (currentWeek) {
        historyWeeks.unshift(currentWeek);
      }
      currentWeek = {
        weekKey: currentWeekInfo.weekKey,
        weekStart: currentWeekInfo.weekStartStr,
        weekEnd: currentWeekInfo.weekEndStr,
        challenges: generateWeeklyChallengesForWeek(currentWeekInfo.weekKey),
        isAllCompleted: false,
        hasClaimedWeeklyBonus: false,
      };
      saveStoredWeeklyChallengeData(currentWeek, historyWeeks);
    }

    return { currentWeek, historyWeeks };
  } catch {
    const newWeek: WeeklyChallengeWeekData = {
      weekKey: currentWeekInfo.weekKey,
      weekStart: currentWeekInfo.weekStartStr,
      weekEnd: currentWeekInfo.weekEndStr,
      challenges: generateWeeklyChallengesForWeek(currentWeekInfo.weekKey),
      isAllCompleted: false,
      hasClaimedWeeklyBonus: false,
    };
    return { currentWeek: newWeek, historyWeeks: [] };
  }
}

export function saveStoredWeeklyChallengeData(
  currentWeek: WeeklyChallengeWeekData,
  historyWeeks: WeeklyChallengeWeekData[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.WEEKLY_CHALLENGES,
      JSON.stringify({ currentWeek, historyWeeks: historyWeeks.slice(0, 10) })
    );
  } catch {
    // Ignore
  }
}

// 4. BGM Preferences
export function loadStoredBgmSettings(): { isPlaying: boolean; volume: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BGM);
    if (!raw) return { isPlaying: false, volume: 0.35 };
    return JSON.parse(raw);
  } catch {
    return { isPlaying: false, volume: 0.35 };
  }
}

export function saveStoredBgmSettings(settings: { isPlaying: boolean; volume: number }): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BGM, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadStoredClaimedRewards(): ClaimedRewardRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMED_REWARDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredClaimedRewards(records: ClaimedRewardRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMED_REWARDS, JSON.stringify(records.slice(-500)));
  } catch {
    // Ignore
  }
}

export function hasStoredRewardBeenClaimed(rewardId: string): boolean {
  try {
    const records = loadStoredClaimedRewards();
    return records.some((r) => r.rewardId === rewardId);
  } catch {
    return false;
  }
}

export function saveNewClaimedReward(record: ClaimedRewardRecord): void {
  try {
    const existing = loadStoredClaimedRewards();
    if (existing.some((r) => r.rewardId === record.rewardId)) return;
    const updated = [record, ...existing];
    saveStoredClaimedRewards(updated);
  } catch {
    // Ignore
  }
}

export function exportBackupJSON(
  quests: QuestItem[],
  exp: number,
  chronicle: ChronicleLog[],
  evaluations?: SoulEvaluationRecord[],
  relics?: RelicItem[],
  claimedRewards?: ClaimedRewardRecord[]
): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.3',
    quests,
    exp,
    chronicle,
    evaluations: evaluations || [],
    relics: relics || [],
    claimedRewards: claimedRewards || loadStoredClaimedRewards(),
  };
  return JSON.stringify(data, null, 2);
}
