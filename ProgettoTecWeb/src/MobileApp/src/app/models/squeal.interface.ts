export enum ContentType {
  text = 'text',
  image = 'image',
  video = 'video',
  position = 'position',
  deleted = 'deleted',
}

export interface Recipients {
  users: string[];
  channels: string[];
  keywords: string[];
}

export interface Squeal {
  _id?: string;
  hex_id?: Number;
  user_id?: String;
  username?: String;
  is_scheduled?: Boolean;
  content_type?: ContentType;
  content?: String;
  recipients?: Recipients;
  created_at?: Date;
  last_modified?: Date;
  comment_section?: string;
  reactions?: {
    positive_reactions?: Number;
    negative_reactions?: Number;
    like?: Number;
    love?: Number;
    laugh?: Number;
    dislike?: Number;
    disgust?: Number;
    disagree?: Number;
  };
  is_in_official_channel?: Boolean;
  impressions?: Number;
}
