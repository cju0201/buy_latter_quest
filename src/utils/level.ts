import { Achievement } from '../types/quest';

export interface LevelInfo {
  level: number;
  currentLevelExp: number;
  nextLevelExp: number;
  title: string;
  progressPercent: number;
  isMaxLevel: boolean;
}

const LEVEL_THRESHOLDS = [
  { level: 1, exp: 0, title: '見習冒險者' },
  { level: 2, exp: 100, title: '冷靜旅人' },
  { level: 3, exp: 250, title: '理性守衛' },
  { level: 4, exp: 450, title: '預算劍士' },
  { level: 5, exp: 700, title: '自律魔導士' },
  { level: 6, exp: 1050, title: '聖光守護者' },
  { level: 7, exp: 1500, title: '預算賢者' },
  { level: 8, exp: 2100, title: '心動大師' },
  { level: 9, exp: 2900, title: '傳奇理財勇者' },
  { level: 10, exp: 3900, title: '心念守望者' },
  { level: 11, exp: 5100, title: '理性策士' },
  { level: 12, exp: 6500, title: '冷靜術士' },
  { level: 13, exp: 8100, title: '慾望獵人' },
  { level: 14, exp: 9900, title: '財庫守護者' },
  { level: 15, exp: 11900, title: '心念賢者' },
  { level: 16, exp: 14100, title: '理性大師' },
  { level: 17, exp: 16500, title: '沉著領主' },
  { level: 18, exp: 19100, title: '公會傳奇' },
  { level: 19, exp: 21900, title: '意志化身' },
  { level: 20, exp: 24900, title: '購物冷靜期宗師' },
];

export function calculateLevel(totalExp: number): LevelInfo {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_THRESHOLDS[i].exp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || currentLevel;
      break;
    }
  }

  const expInCurrentLevel = totalExp - currentLevel.exp;
  const isMaxLevel = currentLevel.level === LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;
  const expNeededForNext = isMaxLevel
    ? currentLevel.exp - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 2].exp
    : nextThreshold.exp - currentLevel.exp;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((expInCurrentLevel / expNeededForNext) * 100)));

  return {
    level: currentLevel.level,
    currentLevelExp: expInCurrentLevel,
    nextLevelExp: expNeededForNext,
    title: currentLevel.title,
    progressPercent,
    isMaxLevel,
  };
}

// Achievement roster
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    title: '初出茅廬',
    description: '首次建立一筆購物冷靜任務',
    icon: '📜',
    category: 'cooldown',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    rewardExp: 20,
  },
  {
    id: 'first_soul_quiz',
    title: '三思而後行',
    description: '首次完成購物靈魂拷問室問答評估',
    icon: '🧠',
    category: 'discipline',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    rewardExp: 25,
  },
  {
    id: 'patience_master',
    title: '耐心修行者',
    description: '首次完整度過冷靜期並迎來重新評估',
    icon: '⏳',
    category: 'cooldown',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    rewardExp: 30,
  },
  {
    id: 'rational_explorer',
    title: '理性冒險家',
    description: '累積完成 5 次購物靈魂問答評估',
    icon: '🔮',
    category: 'discipline',
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
    rewardExp: 40,
  },
  {
    id: 'calm_veteran',
    title: '冷靜高手',
    description: '累積完成 5 次冷靜期任務決策',
    icon: '⚔️',
    category: 'cooldown',
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
    rewardExp: 45,
  },
  {
    id: 'first_abandon',
    title: '第一次守財',
    description: '首次成功放棄衝動購買，守住個人預算',
    icon: '🛡️',
    category: 'savings',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    rewardExp: 25,
  },
  {
    id: 'save_1000',
    title: '精打細算',
    description: '累積保住的預算達到 NT$1,000',
    icon: '🪙',
    category: 'savings',
    progress: 0,
    maxProgress: 1000,
    isUnlocked: false,
    rewardExp: 30,
  },
  {
    id: 'save_5000',
    title: '金庫守護者',
    description: '累積保住的預算達到 NT$5,000',
    icon: '💰',
    category: 'savings',
    progress: 0,
    maxProgress: 5000,
    isUnlocked: false,
    rewardExp: 50,
  },
  {
    id: 'challenge_novice',
    title: '挑戰新手',
    description: '首次完成並領取一項每週消費挑戰',
    icon: '🎯',
    category: 'challenge',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    rewardExp: 25,
  },
  {
    id: 'consecutive_challenger',
    title: '連續冒險者',
    description: '跨週連續完成每週消費挑戰',
    icon: '🔥',
    category: 'challenge',
    progress: 0,
    maxProgress: 2,
    isUnlocked: false,
    rewardExp: 45,
  },
  {
    id: 'collector',
    title: '收藏家',
    description: '解鎖 5 個冒險者圖鑑專屬像素道具',
    icon: '💎',
    category: 'codex',
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
    rewardExp: 40,
  },
  {
    id: 'legend_hero',
    title: '傳說冒險家',
    description: '在公會累計解鎖 10 項以上成就',
    icon: '👑',
    category: 'level',
    progress: 0,
    maxProgress: 10,
    isUnlocked: false,
    rewardExp: 75,
  },
  {
    id: 'quest_planner',
    title: '任務策劃師',
    description: '累計建立 10 筆購物冷靜任務，為每次心動預留思考空間。',
    icon: '🗺️',
    category: 'cooldown',
    progress: 0,
    maxProgress: 10,
    isUnlocked: false,
    rewardExp: 35,
  },
  {
    id: 'mindful_evaluator',
    title: '深度思辨者',
    description: '累計完成 10 次購物靈魂拷問評估。',
    icon: '🧩',
    category: 'discipline',
    progress: 0,
    maxProgress: 10,
    isUnlocked: false,
    rewardExp: 45,
  },
  {
    id: 'budget_guardian',
    title: '荷包守護者',
    description: '累計成功放棄 5 件商品，守住自己的預算。',
    icon: '🏰',
    category: 'savings',
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
    rewardExp: 45,
  },
  {
    id: 'save_10000',
    title: '財庫大師',
    description: '累計保住的預算達到 NT$10,000。',
    icon: '💎',
    category: 'savings',
    progress: 0,
    maxProgress: 10000,
    isUnlocked: false,
    rewardExp: 60,
  },
];
