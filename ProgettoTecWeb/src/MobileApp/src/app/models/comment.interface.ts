export interface Comment {
  _id?: string;
  author_username: string;
  author_id: string;
  text: string;
  timestamp: Date;
}

export interface CommentSection {
  _id?: string;
  squeal_ref?: string;
  comments_array?: Comment[];
}
