export interface TimeRemaining {
  isExpired: boolean;
  text: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  percentElapsed: number;
}

export function calculateTimeRemaining(
  createdAtStr: string,
  deadlineStr: string,
  nowMs: number = Date.now()
): TimeRemaining {
  const createdMs = new Date(createdAtStr).getTime();
  const deadlineMs = new Date(deadlineStr).getTime();
  const totalDuration = Math.max(1, deadlineMs - createdMs);
  const remainingMs = deadlineMs - nowMs;

  if (remainingMs <= 0) {
    return {
      isExpired: true,
      text: '冷靜期結束，可以重新評估',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      percentElapsed: 100,
    };
  }

  const seconds = Math.floor((remainingMs / 1000) % 60);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

  let text = '';
  if (days > 0) {
    text = `${days} 天 ${hours} 小時 ${minutes} 分`;
  } else if (hours > 0) {
    text = `${hours} 小時 ${minutes} 分 ${seconds} 秒`;
  } else {
    text = `${minutes} 分 ${seconds} 秒`;
  }

  const elapsed = Math.max(0, nowMs - createdMs);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return {
    isExpired: false,
    text,
    days,
    hours,
    minutes,
    seconds,
    totalMs: remainingMs,
    percentElapsed,
  };
}

export function formatDateTime(isoStr?: string): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
