export enum Source {
  squeal = 'squeal',
  channel = 'channel',
  user = 'user',
  system = 'system',
}

export enum IdCode {
  newComment = 'newComment',
  newOwner = 'newOwner',
  noMoreVipSMM = 'noMoreVipSMM',
  noMoreSmmVIP = 'noMoreSmmVIP',
  mentionedInSqueal = 'mentionedInSqueal',
  welcomeSqueal = 'welcomeSqueal',
  accountUpdate = 'accountUpdate',
  SMMrequest = 'SMMrequest',
  SMMaccepted = 'SMMaccepted',
  SMMdeclined = 'SMMdeclined',
  banStatusUpdate = 'banStatusUpdate',
  officialStatusUpdate = 'officialStatusUpdate',
}

export interface Notification {
  _id?: string;
  is_unseen: Boolean;
  created_at: Date;
  content: String;
  squeal_ref?: String;
  channel_ref?: String;
  comment_ref?: String;
  sender_ref?: String;
  user_ref: String;
  reply: Boolean;
  source: Source;
  id_code: IdCode;
}
