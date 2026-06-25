import { apiClient } from '@/api/client';
import { supabase } from '@/services/supabase';
import type {
  Complaint,
  NotificationItem,
  Profile,
  QrCode,
  ResolvedQr,
  Transaction,
  Wallet,
} from '@/types/wallet';
import { env, isApiConfigured } from '@/utils/env';
import { AuthenticationError, ConfigurationError } from '@/utils/errors';

export async function getProfile() {
  const { data } = await apiClient.get<{ profile: Profile }>('/api/users/profile');
  return data.profile;
}

export async function updateProfile(input: {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}) {
  const { data } = await apiClient.put<{ profile: Profile }>('/api/users/profile', input);
  return data.profile;
}

export async function uploadProfileAvatar(input: { uri: string; fileName?: string; mimeType?: string }) {
  if (!isApiConfigured) {
    throw new ConfigurationError('API base URL is not configured yet. Add EXPO_PUBLIC_API_BASE_URL.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new AuthenticationError();
  }

  const formData = new FormData();
  formData.append('avatar', {
    uri: input.uri,
    name: input.fileName ?? 'profile-avatar.jpg',
    type: input.mimeType ?? 'image/jpeg',
  } as unknown as File);

  const response = await fetch(`${env.apiBaseUrl}/api/users/profile/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    profile?: Profile;
    avatar_url?: string;
    error?: string;
    userMessage?: string;
  };

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Profile photo upload is not available on the server yet. Please deploy the latest web backend changes.');
    }
    throw new Error(data.userMessage ?? data.error ?? 'Could not upload profile photo.');
  }

  return data.profile ?? data.avatar_url;
}

export async function getWallets() {
  const { data } = await apiClient.get<{ wallets: Wallet[] }>('/api/wallets');
  return data.wallets;
}

export async function createWallet(input: { name: string; currency: string }) {
  const { data } = await apiClient.post<{ wallet: Wallet }>('/api/wallets', input);
  return data.wallet;
}

export async function getWalletDetail(walletId: string) {
  const { data } = await apiClient.get<{
    wallet: Wallet;
    qrCodes: QrCode[];
    transactions: Transaction[];
  }>(`/api/wallets/${walletId}`);
  return data;
}

export async function renameWallet(walletId: string, name: string) {
  const { data } = await apiClient.patch<{ wallet: Wallet }>(`/api/wallets/${walletId}`, { name });
  return data.wallet;
}

export async function sendTransfer(input: {
  from_wallet_id: string;
  to_wallet_number?: string;
  amount?: number;
  description?: string;
  qr_code_id?: string;
  idempotency_key: string;
}) {
  const { data } = await apiClient.post<{
    transaction_id: string;
    reference_id: string;
    status: string;
  }>('/api/transfers', input);
  return data;
}

export async function getTransactions() {
  const { data } = await apiClient.get<{ transactions: Transaction[] }>('/api/transfers');
  return data.transactions;
}

export async function createQrCode(input: {
  wallet_id: string;
  description: string;
  amount: number;
  single_use: boolean;
  expiry_at?: string | null;
}) {
  const { data } = await apiClient.post<{ qrCode: QrCode }>('/api/qr-codes', input);
  return data.qrCode;
}

export async function getQrCodes() {
  const { data } = await apiClient.get<{ qrCodes: QrCode[] }>('/api/qr-codes');
  return data.qrCodes;
}

export async function updateQrCode(qrCodeId: string, isActive: boolean) {
  const { data } = await apiClient.patch<{ qrCode: QrCode }>(`/api/qr-codes/${qrCodeId}`, {
    is_active: isActive,
  });
  return data.qrCode;
}

export async function resolveQrCode(token: string) {
  const { data } = await apiClient.get<ResolvedQr>(`/api/qr-codes/resolve/${token}`);
  return data;
}

type CheckoutReturnUrls = {
  success_url?: string;
  cancel_url?: string;
  return_url?: string;
  mobile_return_url?: string;
};

export async function createGuestCardCheckout(input: { qrCodeId: string } & CheckoutReturnUrls) {
  const { data } = await apiClient.post<{ url: string }>('/api/qr-codes/card-checkout', {
    qr_code_id: input.qrCodeId,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    return_url: input.return_url,
    mobile_return_url: input.mobile_return_url,
  });
  return data.url;
}

export async function createTopUpCheckout(input: { wallet_id: string; amount: number } & CheckoutReturnUrls) {
  const { data } = await apiClient.post<{ url: string }>('/api/payments/create-checkout', {
    wallet_id: input.wallet_id,
    amount: input.amount,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    return_url: input.return_url,
    mobile_return_url: input.mobile_return_url,
  });
  return data.url;
}

export async function reconcileTopUpSession(sessionId: string) {
  const { data } = await apiClient.post<{
    credited: boolean;
    already_credited?: boolean;
    amount?: number;
    reference_id?: string;
    wallet_id?: string;
    reason?: string;
  }>('/api/payments/reconcile-session', {
    session_id: sessionId,
  });
  return data;
}

export async function getNotifications(unread?: boolean) {
  const { data } = await apiClient.get<{ notifications: NotificationItem[] }>('/api/notifications', {
    params: unread ? { unread: true } : undefined,
  });
  return data.notifications;
}

export async function updateNotifications(notificationIds: string[], isRead: boolean) {
  const { data } = await apiClient.patch<{ notifications: NotificationItem[] }>('/api/notifications', {
    notificationIds,
    isRead,
  });
  return data.notifications;
}

export async function deleteNotification(notificationId: string) {
  const { data } = await apiClient.delete<{ message: string }>('/api/notifications', {
    data: { notificationId },
  });
  return data;
}

export async function createComplaint(input: {
  complaintType: string;
  title: string;
  description: string;
  transactionId?: string | null;
  attachmentUrls?: string[];
}) {
  const { data } = await apiClient.post<{ complaint: Complaint }>('/api/complaints', input);
  return data.complaint;
}

export async function getComplaints() {
  const { data } = await apiClient.get<{ complaints: Complaint[] }>('/api/complaints');
  return data.complaints;
}
