const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");

const { Notification, User, Squeal, Channel, Keyword, Chat, CommentSection } = require("./schemas");
const { mentionNotification, squealInOfficialChannel, squealRemovedFromOfficialChannel, squealUpdatedOfficialChannel } = require("./messages.js");
const {
  MAX_DESCRIPTION_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  CHANNEL_NAME_MIN_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  OFFICIAL_CHANNEL_NAME_MIN_LENGTH,
  OFFICIAL_CHANNEL_NAME_MAX_LENGTH,
  KEYWORD_MIN_LENGTH,
  KEYWORD_MAX_LENGTH,
  MEDIA_QUOTA,
} = require("./constants");

/**
 * Usernames must contain 2 to 20 characters and can only consist of letters (both uppercase and lowercase), numbers, and underscores. The username must include at least one letter.
 */
const usernameRegex = new RegExp(`^(?=.*[a-zA-Z])[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`);
//const ausernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{2,20}$/;

/**
 * Channel names should be between 5 and 23 characters long and can only contain lowercase letters, numbers, and underscores.
 */
const channelNameRegex = new RegExp(`^[a-z0-9_]{${CHANNEL_NAME_MIN_LENGTH},${CHANNEL_NAME_MAX_LENGTH}}$`);
//const channelNameRegex = /^[a-z0-9_]{5,23}$/;

/**
 * Official channel names should be between 5 and 23 characters long and can only contain uppercase letters, numbers, and underscores.
 */
const officialChannelNameRegex = new RegExp(`^[A-Z0-9_]{${OFFICIAL_CHANNEL_NAME_MIN_LENGTH},${OFFICIAL_CHANNEL_NAME_MAX_LENGTH}}$`);
//const officialChannelNameRegex = /^[A-Z0-9_]{5,23}$/;

/**
 * Keywords should be between 4 and 20 characters long and can include both uppercase and lowercase letters, as well as numbers.
 */
const keywordRegex = new RegExp(`^[a-zA-Z0-9]{${KEYWORD_MIN_LENGTH},${KEYWORD_MAX_LENGTH}}$`);
//const keywordRegex = /^[a-zA-Z0-9]{4,20}$/;

const mongooseObjectIdRegex = /^[0-9a-fA-F]{24}$/;

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const scheduledSquealsNUM = /\{NUM\}/g;
const scheduledSquealsDATE = /\{DATE\}/g;
const scheduledSquealsTIME = /\{TIME\}/g;

const reactionTypes = ["like", "dislike", "love", "laugh", "disgust", "disagree"];

const contentTypes = ["text", "image", "video", "position", "deleted"];

function replaceString(string, num, date, scheduled_squeal_data) {
  const date_options = { year: "numeric", month: "long", day: "numeric" };
  const english_date = date.toLocaleDateString("en-US", date_options);
  const italian_date = date.toLocaleDateString("it-IT", date_options);

  const time_options = { hour: "numeric", minute: "numeric", hour12: false, timeZone: "Europe/Rome", timeZoneName: "short" };
  const english_time = date.toLocaleTimeString("en-US", time_options);
  const italian_time = date.toLocaleTimeString("it-IT", time_options);

  string = string.replace(/{num}/g, num);

  string = string.replace(/{date-it}/g, italian_date).replace(/{time-it}/g, italian_time);

  string = string.replace(/{date-en}/g, english_date).replace(/{time-en}/g, english_time);

  //scheduled squeals only
  if (scheduled_squeal_data) {
    let date;

    string = string.replace(scheduledSquealsNUM, scheduled_squeal_data.number);

    scheduled_squeal_data.date ? (date = new Date(scheduled_squeal_data.date)) : null;
    if (!date) {
      date = new Date(scheduled_squeal_data.scheduled_date);
    }
    string = string.replace(scheduledSquealsDATE, date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear());
    string = string.replace(scheduledSquealsTIME, date.getUTCHours() + ":" + date.getUTCMinutes() + " UTC");
  }

  return string;
}

//FINDERS
async function findUser(identifier) {
  let response = {};
  if (!identifier) {
    response.error = `User 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await User.findById(identifier);
  } else if (usernameRegex.test(identifier)) {
    //it's a username
    response.data = await User.findOne({ username: identifier });
  } else {
    response.error = `Invalid user 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data) {
    console.log(identifier, response);
    response.error = `User not found.`;
    response.status = 404;
  } else {
    response.error = ``;
    response.status = 200;
  }
  return response;
}

async function findSqueal(identifier, just_official = false, include_deleted = true) {
  //aggiunto il parametro include_deleted e settato di base a false
  let response;
  if (!identifier) {
    return {
      error: `Squeal 'identifier' is required.`,
      status: 400,
    };
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response = await Squeal.findById(identifier);
  } else {
    return {
      error: `Invalid squeal 'identifier'.`,
      status: 400,
    };
  }
  if (!response || (!response.is_in_official_channel && just_official) || (response.content_type == `deleted` && !include_deleted)) {
    return {
      error: `Squeal not found.`,
      status: 404,
    };
  }
  return {
    data: response,
    error: ``,
    status: 200,
  };
}

async function findChannel(identifier, includeBlocked = false, includeOfficial = true) {
  //modificato il default di includeOfficial da false a true
  let response = {};
  if (!identifier) {
    response.error = `Channel 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Channel.findById(identifier);
  } else if (channelNameRegex.test(identifier) || (includeOfficial && officialChannelNameRegex.test(identifier))) {
    //it's a channel name
    response.data = await Channel.findOne({ name: identifier });
  } else {
    response.error = `Invalid 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data || (!includeBlocked && response.data?.is_blocked)) {
    response.status = 404;
    response.error = `Channel not found.`;
  } else {
    response.status = 200;
  }
  return response;
}

async function findKeyword(identifier) {
  let response = {};
  if (!identifier) {
    response.error = `Keyword 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (keywordRegex.test(identifier)) {
    //it's a keyword
    response.data = await Keyword.findOne({ name: identifier });
  } else {
    response.error = `Invalid 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = `Keyword not found.`;
    response.status = 404;
    return response;
  }
  response.error = ``;
  response.status = 200;
  return response;
}

async function findNotification(identifier) {
  let response = {};
  if (!identifier) {
    response.error = `Notification 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Notification.findById(identifier);
  } else {
    response.error = `Invalid 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = `Notification not found.`;
    response.status = 404;
  } else {
    response.error = ``;
    response.status = 200;
  }
  return response;
}

async function findChat(identifier) {
  let response = {};
  if (!identifier) {
    response.error = `Chat 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Chat.findById(identifier);
  } else {
    response.error = `Invalid 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = `Chat not found.`;
    response.status = 404;
  } else {
    response.error = ``;
    response.status = 200;
  }
  return response;
}

async function findCommentSection(identifier) {
  let response = {};
  if (!identifier) {
    response.error = `CommentSection 'identifier' is required.`;
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await CommentSection.findById(identifier);
  } else {
    response.error = `Invalid 'identifier'.`;
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = `CommentSection not found.`;
    response.status = 404;
  } else {
    response.error = ``;
    response.status = 200;
  }
  return response;
}

async function checkForAllUsers(userArray) {
  if (!userArray || userArray.length == 0) return { usersOutcome: true, usersArray: [] };
  const userPromises = userArray.map((user) => {
    let query;
    if (mongooseObjectIdRegex.test(user)) {
      query = { _id: user };
    } else if (usernameRegex.test(user)) {
      query = { username: user };
    } else {
      return false;
    }
    return User.exists(query);
  });
  const userResults = await Promise.all(userPromises);
  const allUserExist = userResults.every((exists) => exists); // true if all users exist
  return { usersOutcome: allUserExist, usersArray: userResults };
}

/**
 * @param channelArray array of channel's ids or names
 */
async function checkForAllChannels(channelArray, includeBlocked = false) {
  //if the parameter is null or empty, return true, and an empty array
  if (!channelArray || channelArray.length == 0) return { channelsOutcome: true, channelsArray: [] };
  //else, check if all the channels exist
  const channelPromises = channelArray.map((channel) => {
    let query;
    if (channelNameRegex.test(channel) || officialChannelNameRegex.test(channel)) {
      query = { name: channel };
    } else if (mongooseObjectIdRegex.test(channel)) {
      query = { _id: channel };
    } else {
      return false;
    }
    return Channel.findOne(query);
  });

  //await for all the promises to resolve
  const channelResults = await Promise.all(channelPromises);

  const nullAndBlockedIndex = [];
  //create an array of indexes of null or blocked channels
  channelResults.forEach((item, index) => {
    if (item === null || item.is_blocked === true) {
      nullAndBlockedIndex.push(index);
    }
  });
  //create an array of the channels that are not null or blocked
  const allChannelExist = channelResults.every((exists) => exists && (exists.is_blocked == false || includeBlocked));

  return { channelsOutcome: allChannelExist, channelsArray: channelResults, notFound: nullAndBlockedIndex.map((index) => channelArray[index]) };
}

async function checkForAllNotifications(notificationArray, user) {
  // Controlla se user è undefined o se notificationArray è vuoto
  if (!user || !notificationArray || notificationArray.length === 0) {
    return { notificationsOutcome: true, notificationsArray: [] };
  }

  // Verifica che ogni elemento in notificationArray sia un ObjectID valido
  const isValidObjectID = (id) => mongooseObjectIdRegex.test(id);
  if (!notificationArray.every(isValidObjectID)) {
    return {
      notificationsOutcome: false,
      notificationsArray: [],
      notFound: notificationArray.filter((notification) => !isValidObjectID(notification)),
    };
  }

  // Verifica se tutte le notifiche nell'array esistono nel database
  const notificationResults = await Notification.find({ _id: { $in: notificationArray } });

  // Estrai gli _id delle notifiche esistenti
  const existingNotificationIds = notificationResults.map((notification) => notification._id);

  // Verifica se tutte le notifiche nell'array sono presenti nelle notifiche dell'utente
  const allNotificationsInUser = notificationArray.every((notification) => user.notifications.includes(notification));

  return {
    notificationsOutcome: allNotificationsInUser,
    notificationsArray: existingNotificationIds,
  };
}

async function containsOfficialChannels(channelArray) {
  //if the parameter is null or empty, return true, and an empty array
  if (!channelArray || channelArray.length == 0) return false;
  const channelPromises = channelArray.map((channel) => {
    return Channel.exists({ _id: channel, is_official: true });
  });
  const channelResults = await Promise.all(channelPromises);
  //return true if at least one channel is official
  const containsOfficial = channelResults.some((exists) => exists);
  return containsOfficial;
}

async function addCommentsCountToSqueals(squeals) {
  const squealIds = squeals.map((squeal) => squeal._id);
  const commentCounts = await CommentSection.aggregate([
    { $match: { squeal_ref: { $in: squealIds } } },
    { $project: { squeal_ref: 1, comments_count: { $size: "$comments_array" } } },
  ]);

  const commentCountsMap = new Map(commentCounts.map((count) => [count.squeal_ref.toString(), count.comments_count]));

  return squeals.map((squeal) => {
    const squealObject = squeal.toObject ? squeal.toObject() : squeal;
    return {
      ...squealObject,
      comments_count: commentCountsMap.get(squeal._id.toString()) || 0,
    };
  });
}

function hasEnoughCharQuota(user, contentType, content) {
  const { extra_daily, daily, weekly, monthly } = user.char_quota;
  //if the user has no daily, weekly or monthly char_quota, return false

  if (daily <= 0 || weekly <= 0 || monthly <= 0) {
    let reason = `You have 0 ` + (daily == 0 ? `daily` : weekly == 0 ? `weekly` : `monthly`) + ` char_quota.`;

    return {
      outcome: false,
      reason: reason,
    };
  }
  var contentLength;
  if (contentType == "text") contentLength = content.length;
  if (contentType == "image") contentLength = MEDIA_QUOTA.image;
  if (contentType == "video") contentLength = MEDIA_QUOTA.video;
  if (contentType == "position") contentLength = MEDIA_QUOTA.position;

  const enoughDaily = contentLength <= daily + extra_daily;
  const enoughWeekly = contentLength <= weekly;
  const enoughMonthly = contentLength <= monthly;
  //check if the user has enough char_quota

  if (!enoughDaily || !enoughWeekly || !enoughMonthly) {
    let reason =
      `You don't have enough ` +
      (enoughDaily ? `daily` : enoughWeekly ? `weekly` : `monthly`) +
      ` char_quota: Your post is ` +
      contentLength +
      ` characters long, but your quota is ` +
      daily +
      ` daily, ` +
      weekly +
      ` weekly and ` +
      monthly +
      ` monthly. You also have ` +
      extra_daily +
      ` extra daily char_quota.`;
    return {
      outcome: false,
      reason: reason,
    };
  }
  return { outcome: true, quotaToSubtract: contentLength };
}

async function removeQuota(user, squealCost) {
  //this function only works after checking if the user has enough char_quota
  const { daily } = user.char_quota;
  if (squealCost > daily) {
    let charDebt = squealCost - daily;
    user.char_quota.daily = 0;
    user.char_quota.extra_daily -= charDebt;
  } else {
    user.char_quota.daily -= squealCost;
  }
  user.char_quota.weekly -= squealCost;
  user.char_quota.monthly -= squealCost;

  await user.save();

  return { outcome: true };
}

async function updateRecipientsUsers(users, squeal) {
  //if it's too much, we can check just the new users
  const { usersOutcome, usersArray } = await checkForAllUsers(users);

  if (!usersOutcome) {
    return {
      status: 404,
      data: { error: `One or more users not found.` },
    };
  }

  const results = addedAndRemoved(
    squeal.recipients.users,
    usersArray.map((user) => user._id)
  );

  const addedUsers = results.added; //id
  const removedUsers = results.removed; //id

  //UPDATE REMOVED USERS and REMOVE NOTIFICATIONS
  if (removedUsers && removedUsers.length > 0) {
    const removedPromises = removedUsers.map(async (user) => {
      const notification = Notification.findOneAndDelete({ squeal_ref: squeal._id, user_ref: user });
      return User.findOneAndUpdate({ _id: user }, { $pull: { notifications: (await notification)._id, "squeals.mentioned_in": squeal._id } }).exec();
    });
    await Promise.all(removedPromises);
  }

  //UPDATE ADDED USERS and ADD NOTIFICATIONS
  if (addedUsers && addedUsers.length > 0) {
    const squealAuthor = await User.findById(squeal.user_id).select("username");
    const addedPromises = addedUsers.map(async (user) => {
      const notification = new Notification({
        squeal_ref: squeal._id,
        created_at: Date.now(),
        content: mentionNotification(squealAuthor.username, squeal.content),
        user_ref: user,
        source: "system",
        id_code: "mentionedInSqueal",
      });
      //add the notification to the notifications array of the added user
      return User.findOneAndUpdate({ _id: user }, { $push: { notifications: (await notification.save())._id, "squeals.mentioned_in": squeal._id } }).exec();
    });
    await Promise.all(addedPromises);
  }

  return {
    status: 200,
    data: { usersArray, addedUsers, removedUsers },
  };
}

async function updateRecipientsChannels(channels, squeal) {
  const { channelsOutcome, channelsArray } = await checkForAllChannels(channels);

  if (!channelsOutcome) {
    return {
      status: 404,
      data: { error: `One or more channels not found.` },
    };
  }

  const results = addedAndRemoved(
    squeal.recipients.channels,
    channelsArray.map((channel) => channel._id)
  );

  const addedChannels = results.added;
  const removedChannels = results.removed;
  const addedOfficialNames = [];
  const removedOfficialNames = [];

  //UPDATE REMOVED CHANNELS
  if (removedChannels && removedChannels.length > 0) {
    const removedResult = await Channel.find({ _id: { $in: removedChannels } });
    const removedPromises = removedResult.map((channel) => {
      if (channel.is_official) removedOfficialNames.push(channel.name);
      channel.squeals.pull(squeal._id);
      return channel.save();
    });
    await Promise.all(removedPromises);
  }

  //UPDATE ADDED CHANNELS
  if (addedChannels && addedChannels.length > 0) {
    const addedResult = await Channel.find({ _id: { $in: addedChannels } });
    const addedPromises = addedResult.map((channel) => {
      if (channel.is_official) addedOfficialNames.push(channel.name);
      channel.squeals.push(squeal._id);
      return channel.save();
    });
    await Promise.all(addedPromises);
  }

  //NOTIFICATIONS
  //squealInOfficialChannel, squealRemovedFromOfficialChannel, squealUpdatedOfficialChannel
  if (addedOfficialNames.length > 0 || removedOfficialNames.length > 0) {
    let message;
    if (addedOfficialNames.length > 0 && removedOfficialNames.length > 0) {
      message = squealUpdatedOfficialChannel(squeal.content, addedOfficialNames, removedOfficialNames);
    } else if (addedOfficialNames.length > 0) {
      message = squealInOfficialChannel(squeal.content, addedOfficialNames);
    } else if (removedOfficialNames.length > 0) {
      message = squealRemovedFromOfficialChannel(squeal.content, removedOfficialNames);
    }

    const notification = new Notification({
      squeal_ref: squeal._id,
      created_at: Date.now(),
      content: message,
      user_ref: squeal.user_id,
      source: "system",
      id_code: "officialStatusUpdate",
    });
    await notification.save();
    await User.findOneAndUpdate({ _id: squeal.user_id }, { $push: { notifications: notification._id } }).exec();
  }

  return {
    status: 200,
    data: { channelsArray, addedChannels, removedChannels },
  };
}

function checkIfArrayIsValid(input_array) {
  if (!input_array) return { isValid: true, value: [] };
  if (Array.isArray(input_array)) {
    return { isValid: true, value: input_array };
  }
  try {
    input_array = JSON.parse(input_array);
    if (!Array.isArray(input_array)) return { isValid: false, value: undefined };
    return { isValid: true, value: input_array };
  } catch (err) {
    return { isValid: false, value: undefined };
  }
}

function checkIfReactionsAreValid(reactions) {
  try {
    reactions = JSON.parse(reactions);
    var { like, love, laugh, dislike, disgust, disagree } = reactions;
    [like, love, laugh, dislike, disgust, disagree] = [like, love, laugh, dislike, disgust, disagree].map(Number);
    if (
      (isNaN(like) && isNaN(love) && isNaN(laugh) && isNaN(dislike) && isNaN(disgust) && isNaN(disagree)) ||
      like < 0 ||
      love < 0 ||
      laugh < 0 ||
      dislike < 0 ||
      disgust < 0 ||
      disagree < 0
    ) {
      return {
        isValid: false,
        value: undefined,
      };
    }

    return {
      isValid: true,
      value: {
        like: isNaN(like) ? undefined : like,
        love: isNaN(love) ? undefined : love,
        laugh: isNaN(laugh) ? undefined : laugh,
        dislike: isNaN(dislike) ? undefined : dislike,
        disgust: isNaN(disgust) ? undefined : disgust,
        disagree: isNaN(disagree) ? undefined : disagree,
      },
    };
  } catch (err) {
    return {
      isValid: false,
      value: undefined,
    };
  }
}

function checkIfRecipientsAreValid(recipients) {
  try {
    //check if recipients is already an object
    if (typeof recipients !== "object") {
      var { users, channels, keywords } = JSON.parse(recipients);
      if (!((users === undefined || Array.isArray(users)) && (keywords === undefined || Array.isArray(keywords)) && (channels === undefined || Array.isArray(channels))))
        return { isValid: false, value: undefined };
      return {
        isValid: true,
        value: {
          users: users || [],
          channels: channels || [],
          keywords: keywords || [],
        },
      };
    } else {
      return {
        isValid: true,
        value: recipients,
      };
    }
  } catch (err) {
    return {
      isValid: false,
      value: undefined,
    };
  }
}

async function updateRecipientsKeywords(keywords, squeal) {
  const results = addedAndRemoved(squeal.recipients.keywords, keywords);
  const addedKeywords = results.added;
  const removedKeywords = results.removed;

  if (removedKeywords && removedKeywords.length > 0) {
    const promises = removedKeywords.map(async (keyword) => {
      const removedKeyword = await Keyword.findOne({ name: keyword });
      if (removedKeyword) {
        removedKeyword.squeals.pull(squeal._id);
        await removedKeyword.save();
      }
    });
    await Promise.all(promises);
  }

  if (addedKeywords && addedKeywords.length > 0) {
    const promises = addedKeywords.map(async (keyword) => {
      const addedKeyword = await Keyword.findOne({ name: keyword });

      if (addedKeyword) {
        addedKeyword.squeals.push(squeal._id);

        await addedKeyword.save();
      } else {
        const newKeyword = new Keyword({
          name: keyword,
          squeals: [squeal._id],
          created_at: new Date(),
        });
        await newKeyword.save();
      }
    });

    await Promise.all(promises);
  }

  return {
    status: 200,
    data: { addedKeywords, removedKeywords },
  };
}

function addedAndRemoved(oldArray, newArray) {
  if (!oldArray) oldArray = [];
  if (!newArray) newArray = [];
  const compare = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };
  let added = newArray.filter((element) => !oldArray.some((oldElement) => compare(oldElement, element)));
  let removed = oldArray.filter((element) => !newArray.some((newElement) => compare(newElement, element)));
  return { added, removed };
}

//TOKEN FUNCTIONS
function generateToken(user_data, expireTime = config.tokenExpireTime) {
  //Aggiungere dati al token se necessario

  const user = {
    _id: user_data._id,
    account_type: user_data.account_type,
    professional_type: user_data.professional_type,
    email: user_data.email,
    username: user_data.username,
    char_quota: user_data.char_quota,
    preferences: user_data.preferences,
    notifications: user_data.notifications,
    messages: user_data.messages,
  };

  const payload = { user };
  const secretKey = config.secretKey; // Sostituisci con una chiave segreta robusta e casuale

  // Crea il token con una data di scadenza (1 ora in questo esempio)
  const token = jwt.sign(payload, secretKey, { expiresIn: expireTime });

  return token;
}
async function checkChar(req, res, next) {
  let user;
  if (mongooseObjectIdRegex.test(req.body.user_id)) user = await User.findById(req.user_id);
  else if (usernameRegex.test(req.body.user_id)) user = await User.findOne({ username: req.user_id });
  if (req.mediaType == "image" || req.mediaType == "video") {
    const hasEnough = hasEnoughCharQuota(user, req.mediaType);
    req.hasEnough = hasEnough.outcome;
  } else {
    req.hasEnough = false;
  }
  next();
}

function verifyToken(req, res, next) {
  if (!req.headers) {
    res.status(400).send(`No headers in request.`);
    return;
  }

  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    req.isTokenValid = false;
    req.tokenError = !token ? "noToken" : "invalidTokenFormat";
    next(); // If the token is not valid, continue without setting req.user_id
  } else {
    const tokenValue = token.slice(7); // Remove "Bearer " from token
    //Verify token with jwt
    jwt.verify(tokenValue, config.secretKey, (err, decodedToken) => {
      if (err) {
        req.isTokenValid = false;
        req.tokenError = err.name;
      } else {
        req.isTokenValid = true;
        req.user_id = decodedToken.user.username;
      }
    });
    next();
  }
}

module.exports = {
  jwt,
  bcrypt,
  replaceString,
  verifyToken,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findChat,
  findCommentSection,
  findNotification,
  checkForAllChannels,
  checkForAllUsers,
  checkForAllNotifications,
  checkIfReactionsAreValid,
  checkIfArrayIsValid,
  verifyToken,
  generateToken,
  addCommentsCountToSqueals,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  checkIfRecipientsAreValid,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
  containsOfficialChannels,
  checkChar,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  emailRegex,
  reactionTypes,
  contentTypes,
  scheduledSquealsNUM,
  scheduledSquealsDATE,
  scheduledSquealsTIME,
};
