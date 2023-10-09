const mongoose = require("mongoose");
const { newOwnerNotification } = require("./messages.js");

// Notification
const NotificationSchema = new mongoose.Schema({
  is_unseen: { type: Boolean, default: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  content: { type: String, default: "" },
  squeal_ref: { type: mongoose.Types.ObjectId, ref: "Squeal" },
  channel_ref: { type: mongoose.Types.ObjectId, ref: "Channel" },
  user_ref: { type: mongoose.Types.ObjectId, ref: "User" },
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
  owned_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  editor_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  profile_info: { type: String, default: "Hi there! I'm using Squealer, my new favourite social network!" },
  profile_picture: { type: String, default: "" },
  smm: { type: mongoose.Types.ObjectId, ref: "User" },
  managed_accounts: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
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

  // Rimuovi il riferimento dello squeal dal campo "squeals" di tutti i canali
  await Channel.updateMany({ squeals: { $in: postedSqueals } }, { $pull: { squeals: { $in: postedSqueals } } });

  // Rimuovi il riferimento dello squeal dal campo "squeals" di tutte le keywords
  await Keyword.updateMany({ squeals: { $in: postedSqueals } }, { $pull: { squeals: { $in: postedSqueals } } });

  // Elimina tutti gli squeals dell'utente dal database
  await Squeal.deleteMany({ _id: { $in: postedSqueals } });

  // remove the reference of the user from the "recipients.users" array of all the squeals
  await Squeal.updateMany({ _id: { $in: mentionedInSqueals } }, { $pull: { "recipients.users": this._id } });

  // trova tutte le notifiche associate all'utente
  await Notification.deleteMany({ _id: { $in: notifications } });

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
      });
      await notification.save();

      //add the channel to the owner's owned_channels
      await User.findOneAndUpdate({ _id: channel.owner }, { $push: { owned_channels: channel._id } });

      //remove the channel from the new owner's editor_channels
      await User.findOneAndUpdate({ _id: channel.owner }, { $pull: { editor_channels: channel._id } });

      //saave changes
      await channel.save();
    } else {
      await channel.Delete();
    }
  }

  //remove the smm if they have one
  if (this.smm != null && this.smm != undefined && this.smm != "") {
    await User.findByIdAndUpdate(this.smm, { $unset: { smm: "" } });
  }

  //remove the user from the db
  await this.deleteOne();
};

const User = mongoose.model("User", UserSchema);

// =========== SQUEAL ===========
const SquealSchema = new mongoose.Schema({
  //_id: { type: mongoose.Types.ObjectId },
  hex_id: { type: Number, index: true },
  user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
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
  is_in_official_channel: { type: Boolean, default: false },
  impressions: { type: Number, default: 0 },
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

  //3) squeal.recipients.keywords sono le keywords destinatarie e devo rimuovere lo squeal da ogni keyword.squeals
  await Keyword.updateMany({ name: { $in: this.recipients.keywords } }, { $pull: { squeals: this._id } });

  //4) cancello le notifiche che avevano come squeal_ref lo squeal cancellato
  await Notification.deleteMany({ squeal_ref: this._id });

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

  //4) cancello le notifiche che avevano come squeal_ref lo squeal cancellato
  await Notification.deleteMany({ squeal_ref: this._id });

  this.deleteOne();
};

SquealSchema.pre("save", function (next) {
  this.reactions.positive_reactions = this.reactions.like + this.reactions.laugh + this.reactions.love;
  this.reactions.negative_reactions = this.reactions.dislike + this.reactions.disagree + this.reactions.disgust;
  next();
});
const Squeal = mongoose.model("Squeal", SquealSchema);

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

  //remove the channel from the users subscribed channels, the channel from the users muted channels,the channel from the users created channels
  await User.updateMany({ _id: { $in: this.subscribers } }, { $pull: { subscribed_channels: this._id, "preferences.muted_channels": this._id } });

  //remove the channel from the owner user
  const owner = await User.findByIdAndUpdate(this.owner, { $pull: { owned_channels: this._id } }).exec();

  //remove the channel from the editors users
  await User.updateMany({ _id: { $in: this.editors } }, { $pull: { editor_channels: this._id } });

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

//PRE functions

//EXPORTS
module.exports = {
  Notification,
  User,
  Squeal,
  Channel,
  Keyword,
};
