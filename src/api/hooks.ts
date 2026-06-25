import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createComplaint,
  createGuestCardCheckout,
  createQrCode,
  createTopUpCheckout,
  createWallet,
  deleteNotification,
  getComplaints,
  getNotifications,
  getProfile,
  getQrCodes,
  getTransactions,
  getWalletDetail,
  getWallets,
  renameWallet,
  reconcileTopUpSession,
  resolveQrCode,
  sendTransfer,
  updateNotifications,
  updateProfile,
  updateQrCode,
  uploadProfileAvatar,
} from '@/api/wallets';

export const queryKeys = {
  profile: ['profile'] as const,
  wallets: ['wallets'] as const,
  walletDetail: (walletId: string) => ['wallet', walletId] as const,
  transactions: ['transactions'] as const,
  qrCodes: ['qrCodes'] as const,
  qrResolve: (token: string) => ['qrResolve', token] as const,
  notifications: ['notifications'] as const,
  complaints: ['complaints'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: getProfile, retry: false });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useWallets() {
  return useQuery({ queryKey: queryKeys.wallets, queryFn: getWallets, retry: false });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
  });
}

export function useWalletDetail(walletId: string) {
  return useQuery({
    queryKey: queryKeys.walletDetail(walletId),
    queryFn: () => getWalletDetail(walletId),
    enabled: Boolean(walletId),
    retry: false,
  });
}

export function useRenameWallet(walletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => renameWallet(walletId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.walletDetail(walletId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    },
  });
}

export function useTransactions() {
  return useQuery({ queryKey: queryKeys.transactions, queryFn: getTransactions, retry: false });
}

export function useSendTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useQrCodes() {
  return useQuery({ queryKey: queryKeys.qrCodes, queryFn: getQrCodes, retry: false });
}

export function useCreateQrCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQrCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}

export function useUpdateQrCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qrCodeId, isActive }: { qrCodeId: string; isActive: boolean }) =>
      updateQrCode(qrCodeId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}

export function useResolveQrCode(token: string) {
  return useQuery({
    queryKey: queryKeys.qrResolve(token),
    queryFn: () => resolveQrCode(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useCreateGuestCardCheckout() {
  return useMutation({ mutationFn: createGuestCardCheckout });
}

export function useCreateTopUpCheckout() {
  return useMutation({ mutationFn: createTopUpCheckout });
}

export function useReconcileTopUpSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reconcileTopUpSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => getNotifications(), retry: false });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationIds, isRead }: { notificationIds: string[]; isRead: boolean }) =>
      updateNotifications(notificationIds, isRead),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useComplaints() {
  return useQuery({ queryKey: queryKeys.complaints, queryFn: getComplaints, retry: false });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.complaints }),
  });
}
