export type UserRole = 'customer' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'blocked';
export type WalletStatus = 'active' | 'frozen' | 'closed';
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';
export type TransactionType = 'transfer' | 'topup' | 'payment' | 'refund' | 'adjustment';

export type Profile = {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  status: UserStatus;
};

export type Wallet = {
  id: string;
  user_id: string;
  wallet_number: string;
  name: string | null;
  currency: string;
  balance: number;
  daily_limit: number;
  daily_spent: number;
  status: WalletStatus;
  created_at: string;
  updated_at?: string;
};

export type Transaction = {
  id: string;
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference_id: string;
  description: string | null;
  qr_code_id: string | null;
  sender_display_name: string | null;
  sender_wallet_number: string | null;
  receiver_display_name: string | null;
  receiver_wallet_number: string | null;
  created_at: string;
  completed_at: string | null;
};

export type QrCode = {
  id: string;
  wallet_id: string;
  token: string;
  description: string;
  amount: number;
  currency: string;
  qr_image_url: string;
  single_use: boolean;
  is_active: boolean;
  paid_count: number;
  expiry_at: string | null;
  created_at: string;
};

export type ResolvedQr = {
  qr: QrCode;
  receiver?: {
    display_name: string | null;
    wallet_number: string;
  };
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link_url: string | null;
  category: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type Complaint = {
  id: string;
  complaint_type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
};
