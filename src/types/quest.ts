export type QuestStatus = 'waiting' | 'review' | 'purchased' | 'abandoned';
export type BudgetMode = 'hourly' | 'monthly_allowance';

export type QuestCategory = 
  | 'clothing' 
  | 'electronics' 
  | 'lifestyle' 
  | 'beauty' 
  | 'entertainment' 
  | 'food' 
  | 'hobby' 
  | 'other';

export interface QuestItem {
  id: string;
  name: string;
  price: number;
  url?: string;
  note?: string;
  category: QuestCategory;
  createdAt: string; // ISO string
  deadline: string;  // ISO string
  initialHours: number; // e.g. 24, 72, 168
  cooldownHours?: number;
  status: QuestStatus;
  decisionAt?: string;
  decision?: 'purchased' | 'abandoned' | 'extended';
  extensionCount: number;
  originalPrice?: number;
}

export interface UserProfile {
  level: number;
  exp: number;
  expForNextLevel: number;
  title: string;
  totalSaved: number;
  totalSpent: number;
  soundEnabled: boolean;
  wagePerHour: number; // For reality-check calculation (default NT$190)
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'cooldown' | 'savings' | 'discipline' | 'level' | 'challenge' | 'codex';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardExp: number;
  isClaimed?: boolean;
}

export interface ChronicleLog {
  id: string;
  questId?: string;
  questName: string;
  timestamp: string;
  type: 'created' | 'extended' | 'abandoned' | 'purchased' | 'levelup' | 'achievement' | 'challenge' | 'evaluation';
  amount?: number;
  expGained: number;
  note?: string;
}

// 唯一獎勵領取紀錄 (保證冪等性，杜絕重複發放)
export interface ClaimedRewardRecord {
  rewardId: string;
  source: 'quest_decision' | 'quest_create' | 'soul_evaluation' | 'weekly_challenge' | 'weekly_bonus' | 'achievement' | 'relic';
  amount: number;
  timestamp: string;
  description: string;
}

// 1. 購物靈魂拷問室資料結構
export interface SoulEvaluationRecord {
  id: string;
  questId?: string;
  itemName: string;
  itemPrice: number;
  answers: {
    questionIndex: number;
    questionText: string;
    selectedOption: string;
    optionIndex: number;
  }[];
  verdictType: 'green_light' | 'caution_budget' | 'extend_cooling' | 'rethink_substitute';
  verdictTitle: string;
  verdictAdvice: string[];
  evaluatedAt: string; // ISO String
}

// 2. 冒險者圖鑑像素道具結構
export interface RelicItem {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  iconSvg: string; // Pixel art SVG symbol
  category: 'shield' | 'hourglass' | 'crystal' | 'chest' | 'medal' | 'special';
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardExp: number;
  isClaimed?: boolean;
}

// 3. 每週消費挑戰資料結構
export interface WeeklyChallengeTemplate {
  id: string;
  emoji: string;
  title: string;
  description: string;
  actionHint: string;
  rewardExp: number;
  targetCount: number;
  verificationType: 'auto_evaluation' | 'auto_decision' | 'auto_quest' | 'auto_abandon' | 'self_reflection';
}

export interface WeeklyChallengeInstance extends WeeklyChallengeTemplate {
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: string;
}

export interface WeeklyChallengeWeekData {
  weekKey: string; // e.g. "2026-W43" (Taiwan Asia/Taipei timezone)
  weekStart: string; // ISO
  weekEnd: string;   // ISO
  challenges: WeeklyChallengeInstance[];
  isAllCompleted: boolean;
  hasClaimedWeeklyBonus: boolean;
}

export type ActiveTab = 'lobby' | 'codex' | 'relics' | 'achievements' | 'chronicle';
