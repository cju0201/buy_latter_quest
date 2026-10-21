import { BudgetMode } from '../types/quest';

export function getBudgetEquivalent(
  amount: number,
  mode: BudgetMode,
  hourlyWage: number,
  monthlyAllowance: number
): string {
  if (mode === 'hourly') {
    return hourlyWage > 0
      ? `約 ${(amount / hourlyWage).toFixed(1)} 小時工資`
      : '請設定預估時薪';
  }

  if (monthlyAllowance <= 0) return '請設定每月零用錢';
  const months = amount / monthlyAllowance;
  const percentage = months * 100;
  return months < 1
    ? `約占每月零用錢 ${percentage < 1 ? '<1' : percentage < 10 ? percentage.toFixed(1) : Math.round(percentage)}%`
    : `約 ${months.toFixed(1)} 個月零用錢`;
}
