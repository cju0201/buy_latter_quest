import { QuestCategory } from '../types/quest';

export interface CategoryMeta {
  key: QuestCategory;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'clothing', label: '服飾穿搭', emoji: '👕' },
  { key: 'electronics', label: '3C 數位', emoji: '📱' },
  { key: 'lifestyle', label: '居家生活', emoji: '🛋️' },
  { key: 'beauty', label: '美妝保養', emoji: '💄' },
  { key: 'entertainment', label: '娛樂遊戲', emoji: '🎮' },
  { key: 'food', label: '美食零嘴', emoji: '🍔' },
  { key: 'hobby', label: '嗜好收藏', emoji: '🎨' },
  { key: 'other', label: '其他好物', emoji: '📦' },
];

export function getCategoryMeta(key: QuestCategory): CategoryMeta {
  return CATEGORIES.find(c => c.key === key) || { key: 'other', label: '其他好物', emoji: '📦' };
}
