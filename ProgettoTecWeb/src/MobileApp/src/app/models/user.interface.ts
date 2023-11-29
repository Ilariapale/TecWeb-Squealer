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
  direct_chats?: { type: [type: String]; default: [] };
  subscribed_channels?: { type: [type: String]; default: [] };
  owned_channels?: { type: [type: String]; default: [] };
  editor_channels?: { type: [type: String]; default: [] };
  profile_info: String;
  profile_picture: String;
  smm?: String;
  managed_accounts?: { type: [type: String]; default: [] };
  pending_requests?: {
    SMM_requests: { type: [type: String]; default: [] }; //SMM FIELD: requests recieved from VIPs
    VIP_requests: { type: [type: String]; default: [] }; //VIP FIELD: requests sent to SMMs
  };
  preferences?: {
    muted_channels: { type: [type: String]; default: [] };
  };
  notifications?: { type: [type: String]; default: [] };
  is_active: Boolean;
}
