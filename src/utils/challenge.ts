import { WeeklyChallengeTemplate, WeeklyChallengeWeekData, WeeklyChallengeInstance } from '../types/quest';

export const CHALLENGE_TEMPLATES: WeeklyChallengeTemplate[] = [
  {
    id: 'ch-substitute',
    emoji: '🧰',
    title: '物盡其用',
    description: '在購買新物品前，巡視家中是否已有功能相近、仍能滿足需求的物品。',
    actionHint: '點擊下方完成個人審查',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'self_reflection',
  },
  {
    id: 'ch-soul-quiz',
    emoji: '🧠',
    title: '心靈探問',
    description: '使用「購物靈魂拷問室」檢驗一件令你心動的商品，獲得客觀判斷卡。',
    actionHint: '在任務卡或大廳點擊「靈魂拷問」完成 5 題評估',
    rewardExp: 25,
    targetCount: 1,
    verificationType: 'auto_evaluation',
  },
  {
    id: 'ch-review-expired',
    emoji: '⚔️',
    title: '勇者抉擇',
    description: '重新檢視已過冷靜期的任務，做出放棄、延長或購買的深思決定。',
    actionHint: '在待重新評估任務卡點擊「進行購物決策」',
    rewardExp: 25,
    targetCount: 1,
    verificationType: 'auto_decision',
  },
  {
    id: 'ch-write-reason',
    emoji: '📝',
    title: '冷靜入庫',
    description: '新增一筆購物冷靜期任務，並清楚寫下當下為什麼想買的心動理由。',
    actionHint: '點擊「＋ 接受新任務」並填寫心動備註',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'auto_quest',
  },
  {
    id: 'ch-free-joy',
    emoji: '🌿',
    title: '零元幸福',
    description: '找出一件不需要花費金錢，也能獲得成就感或快樂的事物（如散步、閱讀、整理）。',
    actionHint: '點擊下方確認本週零元生活實踐',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'self_reflection',
  },
  {
    id: 'ch-compare-price',
    emoji: '🔍',
    title: '貨比三家',
    description: '若真有必要購買，比較 2 家以上同類商品之規格與合理售價。',
    actionHint: '點擊下方確認已進行價格與規格比較',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'self_reflection',
  },
  {
    id: 'ch-audit-spending',
    emoji: '🧾',
    title: '荷包盤點',
    description: '花 3 分鐘回顧最近 7 天的消費帳單，確認是否有盲目跟風的小額支出。',
    actionHint: '點擊下方完成本週自我開銷檢視',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'self_reflection',
  },
  {
    id: 'ch-extend-cooling',
    emoji: '⏳',
    title: '耐力考驗',
    description: '面對不確定的商品，給予自己更多思考時間，延長 24 小時以上。',
    actionHint: '在任務卡選擇「延長冷靜期」',
    rewardExp: 25,
    targetCount: 1,
    verificationType: 'auto_decision',
  },
  {
    id: 'ch-abandon-save',
    emoji: '🛡️',
    title: '理智勝利',
    description: '熱情消退後確認不買，成功將商品金額計入保住預算。',
    actionHint: '將冷靜期任務標記為「放棄購買」',
    rewardExp: 25,
    targetCount: 1,
    verificationType: 'auto_abandon',
  },
  {
    id: 'ch-reflect-trigger',
    emoji: '🪞',
    title: '誘惑復盤',
    description: '回顧最容易讓自己衝動消費的情境（如深夜滑手機、社群限時促銷、壓力大）。',
    actionHint: '點擊下方確認完成衝動情境分析',
    rewardExp: 20,
    targetCount: 1,
    verificationType: 'self_reflection',
  },
];
export function getChallengeDisplayTitle(title: string): string {
  return title.split(/[：:]/, 1)[0].trim();
}
export function getChallengeDisplayTitle(title: string): string {
  return title.split(/[：:]/, 1)[0].trim();
}

// Helper: Get Taiwan Time (Asia/Taipei UTC+8) current week info
export function getTaiwanWeekInfo(date: Date = new Date()): {
  weekKey: string;
  weekStartStr: string;
  weekEndStr: string;
  formattedRange: string;
} {
  // Convert current time to Asia/Taipei offset (+8 hours)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const taiwanTime = new Date(utc + 8 * 3600000);

  const dayOfWeek = taiwanTime.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance to this week's Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(taiwanTime);
  monday.setDate(taiwanTime.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Calculate ISO week number
  const startOfYear = new Date(monday.getFullYear(), 0, 1);
  const pastDaysOfYear = (monday.getTime() - startOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  const weekKey = `${monday.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;

  const formatM = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const formattedRange = `${formatM(monday)}（一）~ ${formatM(sunday)}（日）`;

  return {
    weekKey,
    weekStartStr: monday.toISOString(),
    weekEndStr: sunday.toISOString(),
    formattedRange,
  };
}

// Simple deterministic hash to pick 3 templates for a given weekKey
function hashWeekKey(weekKey: string): number {
  let hash = 0;
  for (let i = 0; i < weekKey.length; i++) {
    hash = (hash << 5) - hash + weekKey.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateWeeklyChallengesForWeek(weekKey: string): WeeklyChallengeInstance[] {
  const hash = hashWeekKey(weekKey);
  const indices: number[] = [];

  // Pick 3 unique templates
  for (let i = 0; i < 3; i++) {
    let idx = (hash + i * 3) % CHALLENGE_TEMPLATES.length;
    while (indices.includes(idx)) {
      idx = (idx + 1) % CHALLENGE_TEMPLATES.length;
    }
    indices.push(idx);
  }

  return indices.map((idx) => {
    const template = CHALLENGE_TEMPLATES[idx];
    return {
      ...template,
      currentCount: 0,
      isCompleted: false,
      isClaimed: false,
    };
  });
}
