import { isAxiosError } from 'axios';

export class ConfigurationError extends Error {
  constructor(message = 'Mobile environment is not configured yet.') {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ConfigurationError) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const message = error.response?.data?.error ?? error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
