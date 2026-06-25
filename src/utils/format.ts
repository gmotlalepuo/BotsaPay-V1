import dayjs from 'dayjs';
import * as Crypto from 'expo-crypto';

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
  return `${prefix}-${Crypto.randomUUID()}`;
}

export function extractQrToken(value: string) {
  const trimmed = value.trim();
  const tokenFromUrl = (() => {
    try {
      const parsed = new URL(trimmed);
      return parsed.searchParams.get('token');
    } catch {
      return null;
    }
  })();

  if (tokenFromUrl) {
    return tokenFromUrl;
  }

  const match = trimmed.match(/\/pay\/([^/?#]+)/);

  if (match?.[1]) {
    return match[1];
  }

  return trimmed;
}
