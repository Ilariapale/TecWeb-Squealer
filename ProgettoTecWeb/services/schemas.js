const mongoose = require("mongoose");
const { newOwnerNotification, deletedManagedAccountNotification, deletedSMMNotification, channelDeletedNotification } = require("./messages.js");
const { removeMedia } = require("./media.js");
const { DAILY_CHAR_QUOTA, WEEKLY_CHAR_QUOTA, MONTHLY_CHAR_QUOTA, EXTRA_DAILY_CHAR_QUOTA } = require("./constants");

// ========== GUEST ==========
const GuestSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  last_login: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  reacted_to: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
});
const Guest = mongoose.model("Guest", GuestSchema);

// ========== CHAT ==========
const ChatSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  partecipants: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
  messages: {
    type: [
      {
        sender: { type: Number, min: 0 },
        text: { type: String },
        timestamp: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
      },
    ],
    default: [],
  },
  last_modified: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
});
const Chat = mongoose.model("Chat", ChatSchema);

// ========== NOTIFICATION ==========
const NotificationSchema = new mongoose.Schema({
  is_unseen: { type: Boolean, default: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  content: { type: String, default: "" },
  squeal_ref: { type: mongoose.Types.ObjectId, ref: "Squeal" },
  channel_ref: { type: mongoose.Types.ObjectId, ref: "Channel" },
  comment_ref: { type: String },
  sender_ref: { type: mongoose.Types.ObjectId, ref: "User" },
  user_ref: { type: mongoose.Types.ObjectId, ref: "User" },
  reply: { type: Boolean, default: false },
  id_code: {
    type: String,
    enum: [
      "newComment",
      "newOwner",
      "newEditor",
      "removedEditor",
      "noMoreVipSMM",
      "noMoreSmmVIP",
      "mentionedInSqueal",
      "welcomeSqueal",
      "accountUpdate",
      "SMMrequest",
      "SMMaccepted",
      "SMMdeclined",
      "banStatusUpdate",
      "officialStatusUpdate",
      "charQuotaUpdate",
      "channelDeleted",
    ],
  },
  source: { type: String, enum: ["squeal", "channel", "user", "system"] },
});
const Notification = mongoose.model("Notification", NotificationSchema);

// ========== USER ==========
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
    mentioned_in: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    reacted_to: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  },
  char_quota: {
    daily: { type: Number, default: DAILY_CHAR_QUOTA },
    weekly: { type: Number, default: WEEKLY_CHAR_QUOTA },
    monthly: { type: Number, default: MONTHLY_CHAR_QUOTA },
    extra_daily: { type: Number, default: EXTRA_DAILY_CHAR_QUOTA },
    earned_daily: { type: Number, default: 0 },
    earned_weekly: { type: Number, default: 0 },
    bought_daily: { type: Number, default: 0 },
    bought_weekly: { type: Number, default: 0 },
    bought_monthly: { type: Number, default: 0 },
  },
  reaction_metrics: {
    popularity_score: { type: Number, default: 0 },
    positive_squeals: { type: Number, default: 0 },
    negative_squeals: { type: Number, default: 0 },
    total_squeals: { type: Number, default: 0 },
    last_checkpoint: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
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
});

UserSchema.methods.Delete = async function () {
  // Removing all the references to the user from the other collections
  // Even if the user is deleted, their reactions to other's squeals are still valid
  const postedSqueals = this.squeals.posted;
  const mentionedInSqueals = this.squeals.mentioned_in;
  const createdChannels = this.owned_channels;
  const notifications = this.notifications;

  //const scheduledSqueals = userToDelete.squeals.scheduled;

  // Remove the reference of the squeal from the "squeals" array of all the users
  await User.updateMany({ "squeals.mentioned_in": { $in: postedSqueals } }, { $pull: { "squeal.mentioned_in": { $in: postedSqueals } } });

  // Remove the reference of the squeal from the "squeals" array of all the channels
  await Channel.updateMany({ squeals: { $in: postedSqueals } }, { $pull: { squeals: { $in: postedSqueals } } });

  // Remove the reference of the squeal from the "squeals" array of all the keywords
  await Keyword.updateMany({ squeals: { $in: postedSqueals } }, { $pull: { squeals: { $in: postedSqueals } } });

  // Remove every comment associated to the user's squeals from the database
  await CommentSection.deleteMany({ squeal_ref: { $in: postedSqueals } });

  // Remove every squeal associated to the user from the database
  await Squeal.deleteMany({ _id: { $in: postedSqueals } });

  // remove the reference of the user from the "recipients.users" array of all the squeals
  await Squeal.updateMany({ _id: { $in: mentionedInSqueals } }, { $pull: { "recipients.users": this._id } });

  // Find every notification associated to the user
  await Notification.deleteMany({ _id: { $in: notifications } });

  await Request.deleteMany({ user_id: this._id });

  //if the channels they owned have editors, pass the ownership to the first editor, otherwise delete the channel

  // 1) find all the channels owned by the user
  const ownedChannels = await Channel.find({ _id: { $in: createdChannels } });

  // 2) for each channel, if there are editors, pass the ownership to the first editor, otherwise delete the channel
  for (const channel of ownedChannels) {
    if (channel.editors.length > 0) {
      //the first editor becomes the new owner of the channel
      channel.owner = channel.editors[0];
      channel.editors.splice(0, 1);

      //notify the new owner
      const owner = await User.findById(channel.owner, "username");
      const notification = new Notification({
        content: newOwnerNotification(owner.username, channel.name),
        user_ref: channel.owner,
        channel_ref: channel._id,
        created_at: new Date(),
        source: "channel",
        id_code: "newOwner",
      });
      await notification.save();

      //add the channel to the owner's owned_channels
      await User.findOneAndUpdate({ _id: channel.owner }, { $push: { owned_channels: channel._id } });

      //remove the channel from the new owner's editor_channels
      await User.findOneAndUpdate({ _id: channel.owner }, { $pull: { editor_channels: channel._id } });

      //save changes
      await channel.save();
    } else {
      await channel.Delete();
    }
  }

  //remove the VIP profile from the smm managed accounts if they have one
  if (this.smm != null && this.smm != undefined && this.smm != "") {
    //mando la notifica al smm
    const newNotification = new Notification({
      user_ref: this.smm,
      created_at: Date.now(),
      content: deletedManagedAccountNotification(this.username),
      source: "system",
      id_code: "noMoreVipSMM",
    });
    const notification = await newNotification.save();

    await User.findByIdAndUpdate(this.smm, { $pull: { managed_accounts: this._id }, $push: { notifications: notification._id } });
  }

  //if the deleted account is a smm, remove the smm from the managed accounts
  if (this.managed_accounts.length > 0) {
    // Send the notification to every smm
    const promises = this.managed_accounts.map(async (managed_account) => {
      const notification = new Notification({
        user_ref: managed_account,
        created_at: Date.now(),
        content: deletedSMMNotification(this.username),
        source: "system",
        id_code: "noMoreSmmVIP",
      });

      return Promise.all([
        notification.save(),
        User.findByIdAndUpdate(managed_account, {
          $unset: { smm: "" },
          $push: { notifications: notification._id },
        }),
      ]);
    });
    await Promise.all(promises);
  }

  if (this.pending_requests.VIP_requests != undefined && this.account_type == "professional" && professional_type == "VIP") {
    // Remove the reference of the user from the "pending_requests.VIP_requests" array of all the SMMs
    await User.updateMany({ _id: { $in: this.pending_requests.VIP_requests } }, { $pull: { "pending_requests.SMM_requests": this._id } });
  } else if (this.pending_requests.SMM_requests != undefined && this.account_type == "professional" && professional_type == "SMM") {
    // Remove the reference of the user from the "pending_requests.SMM_requests" array of all the VIPs
    await User.updateMany({ _id: { $in: this.pending_requests.SMM_requests } }, { $pull: { "pending_requests.VIP_requests": this._id } });
  }

  //remove the user from the db
  await this.deleteOne();
};

const User = mongoose.model("User", UserSchema);

const CommentSectionSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  squeal_ref: { type: mongoose.Types.ObjectId, ref: "Squeal", required: true },
  comments_array: {
    type: [
      {
        author_username: { type: String, required: true },
        author_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        text: { type: String },
        timestamp: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
      },
    ],
    default: [],
  },
});

const CommentSection = mongoose.model("comment_section", CommentSectionSchema);

// =========== SQUEAL ===========
const SquealSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  hex_id: { type: Number, index: true },
  user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  is_scheduled: { type: Boolean, default: false },
  content_type: { type: String, enum: ["text", "image", "video", "position", "deleted"], default: "text" },
  content: { type: String, default: "" },
  recipients: {
    users: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
    channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
    keywords: { type: [{ type: String }], default: [] },
  },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  last_modified: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  comment_section: { type: mongoose.Types.ObjectId, ref: "CommentSection", default: null },
  reactions: {
    positive_reactions: { type: Number, default: 0 },
    negative_reactions: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    disgust: { type: Number, default: 0 },
    disagree: { type: Number, default: 0 },
  },
  reaction_tag: { type: String, enum: ["none", "popular", "unpopular", "controversial"], default: "none" },

  is_in_official_channel: { type: Boolean, default: false },
  impressions: { type: Number, default: 0 },
  reported: {
    by: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
    first_report: { type: Date },
    checked: { type: Boolean, default: false },
    checked_by: { type: mongoose.Types.ObjectId, ref: "User", default: null },
    checked_at: { type: Date },
  },
});

/**
 * This function set the squeal as deleted and preserve it in the db
 */
SquealSchema.methods.DeleteAndPreserveInDB = async function () {
  const deleted_content_type = "deleted";
  const replaceString = "[deleted squeal]";
  //1) squeal.recipients.users are the target users and I have to remove the squeal from each user.squeals.mentioned_in
  await User.updateMany({ _id: { $in: this.recipients.users } }, { $pull: { "squeals.mentioned_in": this._id } });
  //2) squeal.recipients.channels are the target channels and I have to remove the squeal from each channel.squeals
  await Channel.updateMany({ _id: { $in: this.recipients.channels } }, { $pull: { squeals: this._id } });
  // 3) squeal.recipients.keywords are the target keywords and I have to remove the squeal from each keyword.squeals
  await Keyword.updateMany({ name: { $in: this.recipients.keywords } }, { $pull: { squeals: this._id } });
  // 4) Delete the notifications that had the deleted squeal as squeal_ref
  await Notification.deleteMany({ squeal_ref: this._id });
  try {
    if (this.content_type == "image" || this.content_type == "video") {
      await removeMedia(this.content, this.content_type);
    }
  } catch (err) {
    console.error(err);
  }
  this.content_type = deleted_content_type;
  this.content = replaceString;
  this.recipients.users = [];
  this.recipients.channels = [];
  this.recipients.keywords = [];
  this.last_modified = new Date();
  await this.save();
};

/**
 * This function deletes the squeal from the db and all the references to it from the other collections
 */
SquealSchema.methods.Delete = async function () {
  await User.updateMany({ _id: { $in: this.recipients.users } }, { $pull: { "squeals.mentioned_in": this._id } });

  await Channel.updateMany({ _id: { $in: this.recipients.channels } }, { $pull: { squeals: this._id } });

  await Keyword.updateMany({ name: { $in: this.recipients.keywords } }, { $pull: { squeals: this._id } });

  // 4) Delete the notifications that had the deleted squeal as squeal_ref
  await Notification.deleteMany({ squeal_ref: this._id });

  this.deleteOne();
};

SquealSchema.pre("save", function (next) {
  this.reactions.positive_reactions = this.reactions.like + this.reactions.laugh + this.reactions.love;
  this.reactions.negative_reactions = this.reactions.dislike + this.reactions.disagree + this.reactions.disgust;
  next();
});
const Squeal = mongoose.model("Squeal", SquealSchema);

// ========== REQUEST ==========

const RequestSchema = new mongoose.Schema({
  type: { type: String, enum: ["SMM", "VIP", "verified", "standard"], required: true },
  username: { type: String, required: true },
  profile_picture: { type: String },
  user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
});
const Request = mongoose.model("Request", RequestSchema);

// ========== CHANNEL ==========
const ChannelSchema = new mongoose.Schema({
  // _id: { type: mongoose.Types.ObjectId },
  owner: { type: mongoose.Types.ObjectId, ref: "User" },
  editors: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }] },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  is_official: { type: Boolean, default: false },
  can_mute: { type: Boolean, default: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  squeals: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  subscribers: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
  is_blocked: { type: Boolean, default: false },
});

ChannelSchema.methods.Delete = async function () {
  //remove the channel from the squeals recipients
  await Squeal.updateMany({ _id: { $in: this.squeals } }, { $pull: { "recipients.channels": this._id } });
  //if the channel is official and it's the only official in the squeals, remove the official tag from the squeals
  if (this.is_official) {
    const squeals = await Squeal.find({ _id: { $in: this.squeals }, is_in_official_channel: true });
    //for each squeal check if it has at least one official channel in the recipients, otherwise set is_in_official_channel to false
    for (const squeal of squeals) {
      const squealChannels = squeal.recipients.channels;
      const officialChannels = await Channel.find({ _id: { $in: squealChannels }, is_official: true });
      if (officialChannels.length == 0) {
        squeal.is_in_official_channel = false;
        await squeal.save();
      }
    }
  }

  //remove the channel from the users subscribed channels, the channel from the users muted channels,the channel from the users created channels
  await User.updateMany({ _id: { $in: this.subscribers } }, { $pull: { subscribed_channels: this._id, "preferences.muted_channels": this._id } });

  //remove the channel from the owner user
  const owner = await User.findByIdAndUpdate(this.owner, { $pull: { owned_channels: this._id } }).exec();
  //remove the channel from the editors users

  const editors = await User.find({ _id: { $in: this.editors } });
  for (const editor of editors) {
    const notification = new Notification({
      content: channelDeletedNotification(editor.username, this.name, "editor"),
      user_ref: editor._id,
      created_at: new Date(),
      source: "system",
      id_code: "channelDeleted",
    });
    await notification.save();
    await User.findByIdAndUpdate(editor._id, { $pull: { editor_channels: this._id }, $push: { notifications: notification._id } });
  }

  //remove the channel from the db
  await this.deleteOne();
};

const Channel = mongoose.model("Channel", ChannelSchema);

// ========== KEYWORD ==========
const KeywordSchema = new mongoose.Schema({
  // _id: { type: mongoose.Types.ObjectId },
  name: { type: String, required: true, unique: true },
  squeals: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
});
const Keyword = mongoose.model("Keyword", KeywordSchema);

//EXPORTS
module.exports = {
  Guest,
  Notification,
  User,
  Squeal,
  Channel,
  Keyword,
  Request,
  Chat,
  CommentSection,
};
