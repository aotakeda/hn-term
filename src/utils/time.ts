export function formatTimeAgo(unixTime: number): string {
  const now = Date.now() / 1000;
  const diff = now - unixTime;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function formatScore(score?: number): string {
  if (!score) return '0 points';
  return `${score} point${score === 1 ? '' : 's'}`;
}