export enum Source {
  squeal = 'squeal',
  channel = 'channel',
  user = 'user',
  system = 'system',
}

export interface Notification {
  _id?: string;
  is_unseen: Boolean;
  created_at: Date;
  content: String;
  squeal_ref?: String;
  channel_ref?: String;
  comment_ref?: String;
  user_ref: String;
  reply: Boolean;
  source: Source;
}
