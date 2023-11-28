import { Component } from '@angular/core';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  constructor(public timeService: TimeService) {}
  user = {
    user_id: '6532b13897c37a449eee696e',
    account_type: 'moderator',
    professional_type: 'none',
    email: 'ssimonesanna@gmail.com',
    username: 'paulpaccy',
    bio: 'I am a moderator',
    created_at: new Date('2018-08-22T19:08:30.000Z'),
  };

  squeals = [
    {
      _id: '5b7d4f9e8c1d2b0014f3a7f1',
      user_id: '5b7d4f9e8c1d2b0014f3a7f0',
      text: 'This is a squeal',
      created_at: '2018-08-22T19:08:30.000Z',
      likes: 0,
      comments: 0,
      user: {
        user_id: '5b7d4f9e8c1d2b0014f3a7f0',
        username: 'paulpaccy',
        email: '',
      },
    },
  ];
}

/*
  account_type: { type: String, enum: ["standard", "verified", "professional", "moderator"], default: "standard" },
  professional_type: { type: String, enum: ["none", "VIP", "SMM"], default: "none" },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  squeals: {
    posted: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    scheduled: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    mentioned_in: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    reacted_to: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  },
  char_quota: {
    daily: { type: Number, default: 100 },
    weekly: { type: Number, default: 500 },
    monthly: { type: Number, default: 1500 },
    extra_daily: { type: Number, default: 20 },
  },
  weekly_reaction_metrics: {
    positive_squeals: { type: Number, default: 0 },
    negative_squeals: { type: Number, default: 0 },
    controversial_squeals: { type: Number, default: 0 },
  },
  direct_chats: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Chat" }],
    default: [],
  },
  subscribed_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  owned_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  editor_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  profile_info: { type: String, default: "Hi there! I'm using Squealer, my new favourite social network!" },
  profile_picture: { type: String, default: "" },
  smm: { type: mongoose.Types.ObjectId, ref: "User" },
  managed_accounts: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
  pending_requests: {
    SMM_requests: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] }, //SMM FIELD: requests recieved from VIPs
    VIP_requests: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] }, //VIP FIELD: requests sent to SMMs
  },
  preferences: {
    muted_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  },
  notifications: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Notification" }],
    default: [],
  },
  is_active: { type: Boolean, default: true },
*/
