export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}
