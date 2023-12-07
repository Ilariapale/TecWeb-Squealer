export interface UserQuery {
  username?: String;
  created_after?: String;
  created_before?: String;
  max_squeals?: number;
  min_squeals?: number;
  account_type?: AccountType;
  professional_type?: ProfessionalType;
  sort_order?: 'asc' | 'desc';
  sort_by?: 'username' | 'date' | 'squeals';
  //user_id:
  pag_size?: number;
  last_loaded?: String;
}

export enum AccountType {
  guest = 'guest',
  standard = 'standard',
  verified = 'verified',
  professional = 'professional',
  moderator = 'moderator',
}
export enum ProfessionalType {
  none = 'none',
  VIP = 'VIP',
  SMM = 'SMM',
}

export interface User {
  _id?: String;
  account_type: AccountType;
  professional_type: ProfessionalType;
  email: String;
  username: String;
  password?: String;
  created_at: Date;
  squeals?: {
    posted?: [];
    scheduled?: [];
    mentioned_in?: [];
    reacted_to?: [];
  };
  char_quota?: {
    daily: number;
    weekly: number;
    monthly: number;
    extra_daily: number;
  };
  reaction_metrics?: {
    positive_squeals: Number;
    negative_squeals: Number;
    total_squeals: Number;
    last_checkpoint: Date;
  };
  direct_chats?: String[];
  subscribed_channels?: String[];
  owned_channels?: String[];
  editor_channels?: String[];
  profile_info: String;
  profile_picture: String;
  smm?: String;
  managed_accounts?: String[];
  pending_requests?: {
    SMM_requests: String[]; //SMM FIELD: requests recieved from VIPs
    VIP_requests: String[]; //VIP FIELD: requests sent to SMMs
  };
  preferences?: {
    muted_channels: String[];
  };
  notifications?: String[];
  is_active: Boolean;
}
