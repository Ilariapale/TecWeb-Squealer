export interface Message {
  _id?: string;
  sender: number;
  text: string;
  timestamp: Date;
  from?: string;
  chat_id?: string; //just for new chat's
}
export interface Chat {
  _id?: string;
  partecipants: string[];
  messages: Message[];
  last_modified: Date;
  reqSenderPosition: number;
}
export interface ChatPreview {
  _id?: string;
  recipient: string;
  last_message: string;
  sent_by_me: boolean;
  last_modified: Date;
}
