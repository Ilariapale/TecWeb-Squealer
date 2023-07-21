const mongoose = require("mongoose");

//TODO aggiungere le chiamate per reagire ad uno squeal

// Notification
const NotificationSchema = new mongoose.Schema({
  isUnseen: { type: Boolean, default: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  content: { type: String, default: "" },
  squeal_ref: { type: mongoose.Types.ObjectId, ref: "Squeal" },
});
const Notification = mongoose.model("Notification", NotificationSchema);

// User
const UserSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  account_type: { type: String, enum: ["standard", "verified", "professional", "moderator"], default: "standard" },
  professional_type: { type: String, enum: ["none", "VIP", "SMM"], default: "none" },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  squeals: {
    posted: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    scheduled: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    mentionedIn: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
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
  subscribed_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  created_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  profile_info: { type: String, default: "Hi there! I'm using Squealer, my new favourite social network!" },
  profile_picture: { type: String, default: "" },
  smm: { type: mongoose.Types.ObjectId, ref: "User" },
  preferences: {
    muted_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  },
  notifications: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Notification" }],
    default: [],
  },
  isActive: { type: Boolean, default: true },
});
const User = mongoose.model("User", UserSchema);

// Squeal
const SquealSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  hex_id: { type: Number, index: true },
  user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  is_scheduled: { type: Boolean, default: false },
  content_type: { type: String, enum: ["text", "image", "video", "position"], default: "text" },
  content: { type: String, default: "" },
  recipients: {
    users: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
    channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
    keywords: { type: [{ type: String }], default: [] },
  },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  reactions: {
    positive_reactions: { type: Number, default: 0 },
    negative_reaction: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    disgust: { type: Number, default: 0 },
    disagree: { type: Number, default: 0 },
  },
  impressions: { type: Number, default: 0 },
});
const Squeal = mongoose.model("Squeal", SquealSchema);

// Channel
const ChannelSchema = new mongoose.Schema({
  // _id: { type: mongoose.Types.ObjectId },
  creators: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }] },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  is_official: { type: Boolean, default: false },
  can_mute: { type: Boolean, default: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  squeals: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  subscribers: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
  isBlocked: { type: Boolean, default: false },
});
const Channel = mongoose.model("Channel", ChannelSchema);

// Keyword
const KeywordSchema = new mongoose.Schema({
  // _id: { type: mongoose.Types.ObjectId },
  name: { type: String, required: true, unique: true },
  squeals: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
});
const Keyword = mongoose.model("Keyword", KeywordSchema);

//PRE functions

//TODO controllare se funziona
SquealSchema.pre(["save", "findOneAndUpdate", "findByIdAndUpdate"], function (next) {
  console.log("pre save squeal");
  this.positive_reactions = this.reactions.like + this.reactions.laugh + this.reactions.love;
  this.negative_reactions = this.reactions.dislike + this.reactions.disagree + this.reactions.disgust;
  next();
});

UserSchema.pre(["deleteOne", "deleteMany"], async function (next) {
  console.log("pre delete user");
  next();
});
//EXPORTS
module.exports = {
  Notification,
  User,
  Squeal,
  Channel,
  Keyword,
};
