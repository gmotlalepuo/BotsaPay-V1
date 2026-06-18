import dayjs from 'dayjs';

export function formatMoney(amount: number | string | null | undefined, currency = 'BWP') {
  const value = Number(amount ?? 0);
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not available';
  }

  return dayjs(value).format('DD MMM YYYY, HH:mm');
}

export function getDisplayName(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email || 'BotsaPay customer';
}

export function createIdempotencyKey(prefix = 'mobile') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function extractQrToken(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/pay\/([^/?#]+)/);

  if (match?.[1]) {
    return match[1];
  }

  return trimmed;
}
