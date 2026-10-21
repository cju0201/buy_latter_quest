import { BudgetMode, QuestItem } from '../types/quest';
import { getCategoryMeta } from './category';
import { formatDateTime } from './time';
import { getBudgetEquivalent } from './budget';

/**
 * 格式化為 iCalendar / Google 日曆所需的 UTC 時間格式：YYYYMMDDTHHmmssZ
 */
function toCalendarUtcString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/**
 * 取得合理的開始與結束時間
 * - 開始時間：冷靜期結束日期（quest.deadline）
 * - 結束時間：同日開始時間後 30 分鐘
 */
function getEventDates(quest: QuestItem): { startDate: Date; endDate: Date } {
  let startDate = new Date(quest.deadline);
  if (isNaN(startDate.getTime())) {
    startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  // 結束時間設為開始時間 + 30 分鐘（同一天的適當結束時間）
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
  return { startDate, endDate };
}

/**
 * 產生說明文字，提醒使用者重新評估商品需求、價格、預算、替代品與購買動機
 */
export function buildCalendarDescription(
  quest: QuestItem,
  wagePerHour?: number,
  budgetMode: BudgetMode = 'hourly',
  monthlyAllowance = 0
): string {
  const categoryMeta = getCategoryMeta(quest.category);
  const deadlineTaiwanStr = formatDateTime(quest.deadline);

  const lines: string[] = [
    `【BUY LATER QUEST 購物冷靜期結束評估提醒】`,
    ``,
    `恭喜你！這件商品的冷靜期已經結束，衝動購物的多巴胺高峰期已過。`,
    `現在是時候以清醒理性的冒險者之眼，重新檢視這項購買決定：`,
    ``,
    `📦 商品名稱：${quest.name}`,
    `💰 商品價格：NT$ ${quest.price.toLocaleString()}`,
    `🏷️ 商品類別：${categoryMeta.emoji} ${categoryMeta.label}`,
    `⏰ 冷靜期截止時間：${deadlineTaiwanStr} (台灣時間 Asia/Taipei)`,
  ];

  lines.push(`📊 預算換算：${getBudgetEquivalent(quest.price, budgetMode, wagePerHour || 0, monthlyAllowance)}`);

  if (quest.note && quest.note.trim()) {
    lines.push(`📝 當初心動備註：${quest.note.trim()}`);
  }

  if (quest.url && quest.url.trim()) {
    lines.push(`🔗 商品原始連結：${quest.url.trim()}`);
  }

  lines.push(
    ``,
    `⚔️【重新評估 5 大靈魂檢視清單】`,
    `1. 需求檢視：經過等待，現在的生活真的很需要它嗎？沒有它會造成不便嗎？`,
    `2. 預算評估：買了這件商品，會不會擠壓到生活費、儲蓄或更重要的目標？`,
    `3. 替代品：家裡或現有物品中，是否有能達成相同目的的替代方案？`,
    `4. 心動動機：我是真心熱愛需要它，還是當初只是一時特價/網紅推薦的心動？`,
    `5. 購買代價：如果用辛苦工作的時數來換，現在的我依然願意買單嗎？`,
    ``,
    `🛡️ 請回到「BUY LATER QUEST」網站進行最終決策：`,
    `- 【理智放棄】：守住 NT$ ${quest.price.toLocaleString()} 預算，獲得 +100 EXP 與成就！`,
    `- 【深思購買】：確認值得且無悔，理性消費，獲得 +30 EXP。`,
    `- 【再次延長】：若仍有所猶豫，可再給自己 3 天或 7 天沉澱思考。`
  );

  return lines.join('\n');
}

/**
 * 產生 Google 日曆加入連結 (URL)
 * 使用 Google Calendar action=TEMPLATE 格式，不需 API Key 或 OAuth
 */
export function generateGoogleCalendarUrl(quest: QuestItem, wagePerHour?: number, budgetMode: BudgetMode = 'hourly', monthlyAllowance = 0): string {
  const { startDate, endDate } = getEventDates(quest);
  const startUtc = toCalendarUtcString(startDate);
  const endUtc = toCalendarUtcString(endDate);

  const title = `購物冷靜期結束｜${quest.name}`;
  const details = buildCalendarDescription(quest, wagePerHour, budgetMode, monthlyAllowance);

  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', title);
  params.set('dates', `${startUtc}/${endUtc}`);
  params.set('details', details);
  // 指定台灣時區，避免因使用者系統時區造成日期錯亂
  params.set('ctz', 'Asia/Taipei');

  if (quest.url && quest.url.startsWith('http')) {
    params.set('sprop', `website:${quest.url}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * 在新視窗開啟 Google 日曆新增畫面
 */
export function openGoogleCalendar(quest: QuestItem, wagePerHour?: number, budgetMode: BudgetMode = 'hourly', monthlyAllowance = 0): void {
  const url = generateGoogleCalendarUrl(quest, wagePerHour, budgetMode, monthlyAllowance);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * 跳脫 iCalendar (RFC 5545) 文字特殊字元：\, ;, ,, 以及換行
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * 產生符合 RFC 5545 標準的 .ics 檔案字串
 */
export function generateIcsContent(quest: QuestItem, wagePerHour?: number, budgetMode: BudgetMode = 'hourly', monthlyAllowance = 0): string {
  const { startDate, endDate } = getEventDates(quest);
  const startUtc = toCalendarUtcString(startDate);
  const endUtc = toCalendarUtcString(endDate);
  const stampUtc = toCalendarUtcString(new Date());

  const uid = `quest-${quest.id || Date.now()}-${Date.now()}@buylaterquest`;
  const summary = escapeIcsText(`購物冷靜期結束｜${quest.name}`);
  const description = escapeIcsText(buildCalendarDescription(quest, wagePerHour, budgetMode, monthlyAllowance));
  const urlField = quest.url && quest.url.startsWith('http') ? `URL:${escapeIcsText(quest.url)}\r\n` : '';

  // RFC 5545 行結尾必須是 \r\n (CRLF)
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BUY LATER QUEST//Shopping Cooldown Calendar//ZH-TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    urlField.trim(),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:-PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return icsLines.join('\r\n') + '\r\n';
}

/**
 * 下載 .ics 行事曆檔案（支援 Apple 行事曆、Outlook 及其他標準行事曆應用程式）
 */
export function downloadIcsFile(quest: QuestItem, wagePerHour?: number, budgetMode: BudgetMode = 'hourly', monthlyAllowance = 0): void {
  const icsString = generateIcsContent(quest, wagePerHour, budgetMode, monthlyAllowance);
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
  const objectUrl = URL.createObjectURL(blob);

  // 清除檔名中的非法字元與空格
  const safeName = quest.name
    .replace(/[\/\\:*?"<>|\u0000-\u001F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30)
    .trim();

  const fileName = `buy-later-${safeName || 'quest'}.ics`;

  const link = document.createElement('a');
  link.href = objectUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}
