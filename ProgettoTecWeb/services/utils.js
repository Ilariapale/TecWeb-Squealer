const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const { mentionNotification, officialNotificationAdd, officialNotificationRemove } = require("./messages.js");
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

const reactionTypes = ["like", "dislike", "love", "laugh", "disgust", "disagree"];

const contentTypes = ["text", "image", "video", "position", "deleted"];

//FINDERS
async function findUser(identifier) {
  let response = {};
  if (!identifier) {
    response.error = "User identifier is required.";
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
    response.error = "Invalid user identifier";
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = "User not found";
    response.status = 404;
  } else {
    response.error = "";
    response.status = 200;
  }
  return response;
}

async function findSqueal(identifier, just_official = false, include_deleted = true) {
  //aggiunto il parametro include_deleted e settato di base a false
  let response;
  if (!identifier) {
    return {
      error: "Squeal identifier is required.",
      status: 400,
    };
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response = await Squeal.findById(identifier);
  } else {
    return {
      error: "Invalid squeal identifier",
      status: 400,
    };
  }
  if (!response || (!response.is_in_official_channel && just_official) || (response.content_type == "deleted" && !include_deleted)) {
    return {
      error: "Squeal not found",
      status: 404,
    };
  }
  return {
    data: response,
    error: "",
    status: 200,
  };
}

async function findChannel(identifier, includeBlocked = false, includeOfficial = true) {
  //modificato il default di includeOfficial da false a true
  //TODO aggiunto il regex dei canali ufficiali, controllare se va bene ovunque
  let response = {};
  if (!identifier) {
    response.error = "Channel identifier is required.";
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
    response.error = "Invalid identifier";
    response.status = 400;
    return response;
  }
  if (!response.data || (!includeBlocked && response.data?.is_blocked)) {
    response.status = 404;
    response.error = "Channel not found";
  } else {
    response.status = 200;
  }
  return response;
}

async function findKeyword(identifier) {
  let response = {};
  if (!identifier) {
    response.error = "Keyword identifier is required.";
    response.status = 400;
    return response;
  }
  if (keywordRegex.test(identifier)) {
    //it's a keyword
    response.data = await Keyword.findOne({ name: identifier });
  } else {
    response.error = "Invalid identifier";
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = "Keyword not found";
    response.status = 404;
    return response;
  }
  response.error = "";
  response.status = 200;
  return response;
}

async function findNotification(identifier) {
  let response = {};
  if (!identifier) {
    response.error = "Notification identifier is required.";
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Notification.findById(identifier);
  } else {
    response.error = "Invalid identifier";
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = "Notification not found";
    response.status = 404;
  } else {
    response.error = "";
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

async function checkForAllChannels(channelArray) {
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
  const allChannelExist = channelResults.every((exists) => exists && exists.is_blocked == false);

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

function hasEnoughCharQuota(user, contentType, content) {
  const { extra_daily, daily, weekly, monthly } = user.char_quota;
  //if the user has no daily, weekly or monthly char_quota, return false
  if (daily <= 0 || weekly <= 0 || monthly <= 0) {
    let reason = "You have 0 " + (daily == 0 ? "daily" : weekly == 0 ? "weekly" : "monthly") + " char_quota.";

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
      "You don't have enough " +
      (enoughDaily ? "daily" : enoughWeekly ? "weekly" : "monthly") +
      " char_quota: Your post is " +
      contentLength +
      " characters long, but your quota is " +
      daily +
      " daily, " +
      weekly +
      " weekly and " +
      monthly +
      " monthly. You also have " +
      extra_daily +
      " extra daily char_quota.";
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
  //se user è undefined creo un array vuoto
  if (!users) users = [];
  //if it's too much, we can check just the new users
  const { usersOutcome, usersArray } = await checkForAllUsers(users);
  if (!usersOutcome) {
    return {
      status: 404,
      data: { error: "One or more users not found." },
    };
  }
  console.log("--------------------------------");
  const results = addedAndRemoved(squeal.recipients.users, usersArray);
  const addedUsers = results.added;
  const removedUsers = results.removed;
  //remove squeal and notification from removed users
  if (removedUsers && removedUsers.length > 0) {
    const removedPromises = removedUsers.map(async (user) => {
      const removedUser = await User.findById(user);
      if (removedUser) {
        //remove the notification about this squeal and owned by this user
        let notification = await Notification.findOneAndDelete({ squeal_ref: squeal._id, user_ref: removedUser._id });
        removedUser.notifications.pull(notification._id);
        removedUser.squeals.mentioned_in.pull(squeal._id);
        await removedUser.save();
      }
    });
    await Promise.all(removedPromises);
  }

  //add squeal and notification to added users
  if (addedUsers && addedUsers.length > 0) {
    const addedPromises = addedUsers.map(async (user) => {
      const addedUser = await User.findById(user);
      if (addedUser) {
        let squealOwner = await User.findById(squeal.user_id).select("username");
        const newNotification = new Notification({
          squeal_ref: squeal._id,
          created_at: Date.now(),
          content: mentionNotification(squealOwner.username, squeal.content),
          user_ref: addedUser._id,
        });
        await newNotification.save();
        addedUser.notifications.push(newNotification._id);
        addedUser.squeals.mentioned_in.push(squeal._id);
        await addedUser.save();
      }
    });
    await Promise.all(addedPromises);
  }
  return {
    status: 200,
    data: { usersArray, addedUsers, removedUsers },
  };

  //squeal.recipients.users = usersArray;
}

async function updateRecipientsChannels(channels, squeal) {
  const { channelsOutcome, channelsArray } = await checkForAllChannels(channels);
  if (!channelsOutcome) {
    return {
      status: 404,
      data: { error: "One or more channels not found." },
    };
  }
  const results = addedAndRemoved(squeal.recipients.channels, channelsArray);
  const addedChannels = results.added;
  const removedChannels = results.removed;
  //remove squeal and notification from removed channels
  if (removedChannels && removedChannels.length > 0) {
    const removedPromises = removedChannels.map(async (channel) => {
      const removedChannel = await Channel.findById(channel);
      if (removedChannel) {
        removedChannel.squeals.pull(squeal._id);
        if (removedChannel.is_official) {
          //if the channel was official, remove the notification sent when the squeal was added to that official channel
          //let notification = await Notification.findOneAndDelete({ squeal_ref: squeal._id, user_ref: squeal.user_id });
          //if (notification) await User.findByIdAndUpdate(squeal.user_id, { $pull: { notifications: notification._id } });
          //add the remove notification
          let squealOwner = await User.findById(squeal.user_id).select("username");
          let removeNotification = new Notification({
            squeal_ref: squeal._id,
            created_at: Date.now(),
            content: officialNotificationRemove(squealOwner.username, squeal.content, removedChannel.name),
            user_ref: squeal.user_id,
          });
          await removeNotification.save();
          await User.findByIdAndUpdate(squeal.user_id, { $push: { notifications: removeNotification._id } });
        }
        await removedChannel.save();
      }
    });
    await Promise.all(removedPromises);
  }
  //add squeal and notification to added channels
  if (addedChannels && addedChannels.length > 0) {
    const addedPromises = addedChannels.map(async (channel) => {
      const addedChannel = await Channel.findById(channel);
      if (addedChannel) {
        addedChannel.squeals.push(squeal._id);
        if (addedChannel.is_official) {
          let squealOwner = await User.findById(squeal.user_id).select("username");
          let notification = new Notification({
            squeal_ref: squeal._id,
            created_at: Date.now(),
            content: officialNotificationAdd(squealOwner.username, squeal.content, addedChannel.name),
            user_ref: squeal.user_id,
          });
          await notification.save();
          await User.findByIdAndUpdate(squeal.user_id, { $push: { notifications: notification._id } });
        }
        await addedChannel.save();
      }
    });
    await Promise.all(addedPromises);
  }

  return {
    status: 200,
    data: { channelsArray, addedChannels, removedChannels },
  };
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
function generateToken(userId) {
  //Aggiungere dati al token se necessario
  const payload = { userId };
  const secretKey = config.secretKey; // Sostituisci con una chiave segreta robusta e casuale

  // Crea il token con una data di scadenza (1 ora in questo esempio)
  const token = jwt.sign(payload, secretKey, { expiresIn: config.tokenExpireTime });

  return token;
}

function verifyToken(req, res, next) {
  if (!req.headers) {
    return res.status(400).send("No headers in request");
  }

  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    req.isTokenValid = false;
    next(); // If the token is not valid, continue without setting req.user_id
  } else {
    const tokenValue = token.slice(7); // Remove "Bearer " from token
    //Verify token with jwt
    jwt.verify(tokenValue, config.secretKey, (err, decodedToken) => {
      if (err) {
        req.isTokenValid = false;
      } else {
        req.isTokenValid = true;
        req.user_id = decodedToken.userId;
      }
      next();
    });
  }
  /*
  if (!token) {
    req.isTokenValid = false;
  } else {
    jwt.verify(token, config.secretKey, (err, decodedToken) => {
      if (err) {
        req.isTokenValid = false;
      } else {
        req.isTokenValid = true;
        req.user_id = decodedToken.userId;
      }
    });
  }
  next();
  */
}

module.exports = {
  jwt,
  bcrypt,
  verifyToken,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
  checkForAllChannels,
  checkForAllUsers,
  checkForAllNotifications,
  verifyToken,
  generateToken,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
  containsOfficialChannels,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  emailRegex,
  reactionTypes,
  contentTypes,
};
