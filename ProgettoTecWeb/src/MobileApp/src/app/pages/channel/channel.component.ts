import { Component } from '@angular/core';
import { Channel } from 'src/app/models/channel.interface';
import { TimeService } from 'src/app/services/time.service';
import { Squeal, ContentType, Recipients } from 'src/app/models/squeal.interface';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
})
export class ChannelComponent {
  channel: Channel = {
    _id: '123456789012345678901234',
    owner: '123456789012345678901234',
    editors: ['123456789012345678901234', '123456789012345678901234'],
    name: 'channel name',
    description: 'channel description',
    is_official: false,
    can_mute: true,
    created_at: new Date(),
    squeals: ['123456789012345678901234', '123456789012345678901234'],
    subscribers: ['123456789012345678901234', '123456789012345678901234'],
    is_blocked: false,
  };

  squeals: Squeal[] = [
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
    {
      _id: '123456789012345678901234',
      hex_id: 1234567890,
      user_id: '123456789012345678901234',
      username: 'username',
      is_scheduled: false,
      content_type: ContentType.text,
      content: 'squeal content',
      recipients: {
        users: ['123456789012345678901234', '123456789012345678901234'],
        channels: ['123456789012345678901234', '123456789012345678901234'],
        keywords: ['keyword', 'keyword'],
      },
      created_at: new Date(),
      last_modified: new Date(),
      comment_section: '123456789012345678901234',
      reactions: {
        positive_reactions: 0,
        negative_reactions: 0,
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
      is_in_official_channel: false,
      impressions: 0,
      comments_count: 0,
    },
  ];

  bannerClass = '';
  muted: boolean = false;

  constructor(public timeService: TimeService) {}

  ngOnInit(): void {}

  toggleMute() {
    this.muted = !this.muted;
  }
}

/*

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
  comments_count?: Number;
}

*/
