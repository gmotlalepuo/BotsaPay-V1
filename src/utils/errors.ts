import { isAxiosError } from 'axios';

export class ConfigurationError extends Error {
  constructor(message = 'Mobile environment is not configured yet.') {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Your secure session has expired. Please sign in again.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function friendlyDatabaseMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('users_phone_number_key') ||
    normalized.includes('profiles_phone_number_key') ||
    (normalized.includes('phone') && normalized.includes('unique')) ||
    (normalized.includes('phone_number') && normalized.includes('duplicate')) ||
    (normalized.includes('duplicate key') && normalized.includes('phone'))
  ) {
    return 'This phone number is already linked to another BotsaPay account. Please use a different number or contact support.';
  }

  if (
    normalized.includes('users_email_key') ||
    normalized.includes('profiles_email_key') ||
    (normalized.includes('email') && normalized.includes('unique')) ||
    (normalized.includes('email') && normalized.includes('duplicate')) ||
    (normalized.includes('duplicate key') && normalized.includes('email'))
  ) {
    return 'This email address is already linked to another BotsaPay account.';
  }

  if (normalized.includes('duplicate key') || normalized.includes('unique constraint')) {
    return 'This information is already in use. Please check your details and try again.';
  }

  if (normalized.includes('foreign key') || normalized.includes('violates foreign key constraint')) {
    return 'We could not find one of the records needed to complete this action. Please refresh and try again.';
  }

  if (
    (normalized.includes('insufficient') && normalized.includes('balance')) ||
    normalized.includes('insufficient_funds')
  ) {
    return 'You do not have enough available balance to complete this payment.';
  }

  if (normalized.includes('wallet') && (normalized.includes('frozen') || normalized.includes('inactive'))) {
    return 'This wallet is not active. Please choose another wallet or contact support.';
  }

  if (normalized.includes('qr') && (normalized.includes('expired') || normalized.includes('inactive'))) {
    return 'This QR payment request is no longer available.';
  }

  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) {
    return 'The email or password you entered is incorrect.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (normalized.includes('jwt') || normalized.includes('token') || normalized.includes('session expired')) {
    return 'Your secure session has expired. Please sign in again.';
  }

  if (normalized.includes('row level security') || normalized.includes('permission denied')) {
    return 'You do not have permission to complete this action. Please sign in again or contact support.';
  }

  if (normalized.includes('network error') || normalized.includes('timeout') || normalized.includes('failed to fetch')) {
    return 'We could not connect to BotsaPay. Please check your internet connection and try again.';
  }

  return message;
}

function isProbablyRawTechnicalMessage(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('_key') ||
    normalized.includes('constraint') ||
    normalized.includes('duplicate key') ||
    normalized.includes('violates') ||
    normalized.includes('sql') ||
    normalized.includes('postgres') ||
    normalized.includes('pgrst') ||
    normalized.includes('23505')
  );
}

function getStatusMessage(status?: number) {
  switch (status) {
    case 400:
      return 'Please check your details and try again.';
    case 401:
      return 'Your secure session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to complete this action.';
    case 404:
      return 'We could not find the information needed to complete this action.';
    case 409:
      return 'This information is already in use. Please check your details and try again.';
    case 422:
      return 'Some details are invalid. Please check your information and try again.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'BotsaPay is temporarily unavailable. Please try again shortly.';
    default:
      return null;
  }
}

function collectStringMessages(value: unknown, messages: string[] = []) {
  if (!value) {
    return messages;
  }

  if (typeof value === 'string') {
    if (value.trim()) {
      messages.push(value);
    }
    return messages;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStringMessages(item, messages));
    return messages;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const preferredKeys = [
      'userMessage',
      'friendlyMessage',
      'message',
      'error',
      'detail',
      'details',
      'hint',
      'description',
      'code',
    ];

    preferredKeys.forEach((key) => collectStringMessages(record[key], messages));

    Object.entries(record).forEach(([key, item]) => {
      if (!preferredKeys.includes(key)) {
        collectStringMessages(item, messages);
      }
    });
  }

  return messages;
}

function getRawServerMessages(error: unknown) {
  if (!isAxiosError(error)) {
    return [];
  }

  const data = error.response?.data;
  const messages = collectStringMessages(data);

  if (error.message) {
    messages.push(error.message);
  }

  return [...new Set(messages)];
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ConfigurationError || error instanceof AuthenticationError) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const messages = getRawServerMessages(error);

    for (const message of messages) {
      const friendlyMessage = friendlyDatabaseMessage(message);
      if (friendlyMessage !== message || !isProbablyRawTechnicalMessage(message)) {
        return isProbablyRawTechnicalMessage(friendlyMessage) ? GENERIC_ERROR_MESSAGE : friendlyMessage;
      }
    }

    return getStatusMessage(error.response?.status) ?? 'The request could not be completed. Please try again.';
  }

  if (error instanceof Error) {
    const friendlyMessage = friendlyDatabaseMessage(error.message);
    return isProbablyRawTechnicalMessage(friendlyMessage) ? GENERIC_ERROR_MESSAGE : friendlyMessage;
  }

  return GENERIC_ERROR_MESSAGE;
}
