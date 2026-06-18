import { create } from 'axios';

import { supabase } from '@/services/supabase';
import { env, isApiConfigured } from '@/utils/env';
import { ConfigurationError } from '@/utils/errors';

export const apiClient = create({
  baseURL: env.apiBaseUrl || 'https://api.placeholder.local',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!isApiConfigured) {
    throw new ConfigurationError(
      'API base URL is not configured yet. Add EXPO_PUBLIC_API_BASE_URL before calling backend routes.',
    );
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
