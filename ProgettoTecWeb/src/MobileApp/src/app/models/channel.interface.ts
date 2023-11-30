export interface Channel {
  _id?: String;
  owner: String;
  editors: String[];
  name: String;
  description: String;
  is_official: boolean;
  can_mute: boolean;
  created_at: Date;
  squeals: String[];
  subscribers: String[];
  is_blocked: boolean;
}
