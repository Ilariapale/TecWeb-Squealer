export interface ChannelQuery {
  name?: String;
  created_after?: String;
  created_before?: String;
  max_subscribers?: Number;
  min_subscribers?: Number;
  max_squeals?: Number;
  min_squeals?: Number;
  is_official?: Boolean;
  sort_order?: String;
  sort_by?: String;
  pag_size?: Number;
  last_loaded?: String;
}

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
