enum AccountType {
  guest = 'guest',
  standard = 'standard',
  verified = 'verified',
  professional = 'professional',
  moderator = 'moderator',
}
enum ProfessionalType {
  none = 'none',
  VIP = 'VIP',
  SMM = 'SMM',
}

export interface User {
  _id: number;
  account_type: AccountType;
  professional_type: {
    type: String;
    enum: ProfessionalType;
    default: 'none';
  };
  email: { type: String; required: true; unique: true };
  username: { type: String; required: true; unique: true };
  password: { type: String; required: true };
  created_at: { type: Date };
  squeals: {
    posted: { type: [type: String]; default: [] };
    scheduled: { type: [type: String]; default: [] };
    mentioned_in: { type: [type: String]; default: [] };
    reacted_to: { type: [type: String]; default: [] };
  };
  char_quota: {
    daily: { type: Number; default: 100 };
    weekly: { type: Number; default: 500 };
    monthly: { type: Number; default: 1500 };
    extra_daily: { type: Number; default: 20 };
  };
  weekly_reaction_metrics: {
    positive_squeals: { type: Number; default: 0 };
    negative_squeals: { type: Number; default: 0 };
    controversial_squeals: { type: Number; default: 0 };
  };
  direct_chats: { type: [type: String]; default: [] };
  subscribed_channels: { type: [type: String]; default: [] };
  owned_channels: { type: [type: String]; default: [] };
  editor_channels: { type: [type: String]; default: [] };
  profile_info: {
    type: String;
    default: "Hi there! I'm using Squealer, my new favourite social network!";
  };
  profile_picture: { type: String; default: '' };
  smm: { type: String };
  managed_accounts: { type: [type: String]; default: [] };
  pending_requests: {
    SMM_requests: { type: [type: String]; default: [] }; //SMM FIELD: requests recieved from VIPs
    VIP_requests: { type: [type: String]; default: [] }; //VIP FIELD: requests sent to SMMs
  };
  preferences: {
    muted_channels: { type: [type: String]; default: [] };
  };
  notifications: { type: [type: String]; default: [] };
  is_active: { type: Boolean; default: true };
}
