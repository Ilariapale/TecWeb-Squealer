export enum ContentType {
  text = 'text',
  image = 'image',
  video = 'video',
  position = 'position',
  deleted = 'deleted',
}
export interface Squeal {
  _id: String;
  hex_id: { type: Number; index: true };
  user_id: String;
  username: { type: String };
  is_scheduled: { type: Boolean; default: false };
  content_type: ContentType;
  content: { type: String; default: '' };
  recipients: {
    users: {
      type: [String];
      default: [];
    };
    channels: {
      type: [String];
      default: [];
    };
    keywords: { type: [{ type: String }]; default: [] };
  };
  created_at: { type: Date };
  last_modified: { type: Date };
  comment_section: String;
  reactions: {
    positive_reactions: { type: Number; default: 0 };
    negative_reactions: { type: Number; default: 0 };
    like: { type: Number; default: 0 };
    love: { type: Number; default: 0 };
    laugh: { type: Number; default: 0 };
    dislike: { type: Number; default: 0 };
    disgust: { type: Number; default: 0 };
    disagree: { type: Number; default: 0 };
  };
  is_in_official_channel: { type: Boolean; default: false };
  impressions: { type: Number; default: 0 };
}
