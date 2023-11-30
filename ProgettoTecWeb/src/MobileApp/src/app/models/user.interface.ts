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
    posted: [];
    scheduled: [];
    mentioned_in: [];
    reacted_to: [];
  };
  char_quota: {
    daily: number;
    weekly: number;
    monthly: number;
    extra_daily: number;
  };
  weekly_reaction_metrics?: {
    positive_squeals: Number;
    negative_squeals: Number;
    controversial_squeals: Number;
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
