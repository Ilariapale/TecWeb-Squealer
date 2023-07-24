const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
/**
 * Usernames must contain 2 to 20 characters and can only consist of letters (both uppercase and lowercase), numbers, and underscores. The username must include at least one letter.
 */
const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{2,20}$/;

/**
 * Channel names should be between 5 and 23 characters long and can only contain lowercase letters, numbers, and underscores.
 */
const channelNameRegex = /^[a-z0-9_]{5,23}$/;

/**
 * Official channel names should be between 5 and 23 characters long and can only contain uppercase letters, numbers, and underscores.
 */
const officialChannelNameRegex = /^[A-Z0-9_]{5,23}$/;

/**
 * Keywords should be between 4 and 20 characters long and can include both uppercase and lowercase letters, as well as numbers.
 */
const keywordRegex = /^[a-zA-Z0-9]{4,20}$/;

const mongooseObjectIdRegex = /^[0-9a-fA-F]{24}$/;

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const reactionTypes = ["like", "dislike", "love", "laugh", "disgust", "disagree"];

const mediaQuota = { image: 125, video: 300, position: 150 }; //char_quota per image

const mentionNotification = (username, message) => `@${username} has mentioned you in a squeal! Check it out!\n${message.substring(0, 30)}...`;

const officialNotification = (username, message, channel) =>
  `Congratulations @${username}! Your squeal has been featured on §${channel} channel! Check it out!\n"${message.substring(0, 30)}..."`;
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

async function findSqueal(identifier) {
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
  if (!response) {
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

async function findChannel(identifier) {
  let response = {};
  if (!identifier) {
    response.error = "Channel identifier is required.";
    response.status = 400;
    return response;
  }
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Channel.findById(identifier);
  } else if (channelNameRegex.test(identifier)) {
    //it's a channel name
    response.data = await Channel.findOne({ name: identifier });
  } else {
    response.error = "Invalid identifier";
    response.status = 400;
    return response;
  }
  if (!response.data || response.data?.is_blocked) {
    response.error = "Channel not found";
    response.status = 404;
  } else {
    response.error = "";
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
  if (!channelArray || channelArray.length == 0) return { channelsOutcome: true, channelsArray: [] };
  const channelPromises = channelArray.map((channel) => {
    let query;
    if (mongooseObjectIdRegex.test(channel)) {
      query = { _id: channel };
    } else if (channelNameRegex.test(channel) || officialChannelNameRegex.test(channel)) {
      query = { name: channel };
    } else {
      return false;
    }
    return Channel.exists(query);
  });

  const channelResults = await Promise.all(channelPromises);
  const allChannelExist = channelResults.every((exists) => exists); // true if all channels exist
  return { channelsOutcome: allChannelExist, channelsArray: channelResults };
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
  if (contentType == "image") contentLength = mediaQuota.image;
  if (contentType == "video") contentLength = mediaQuota.video;
  if (contentType == "position") contentLength = mediaQuota.position;

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
      data: { error: "One or more users not found." },
    };
  }
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
        removedUser.squeals.mentionedIn.pull(squeal._id);
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
        addedUser.squeals.mentionedIn.push(squeal._id);
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
          let notification = await Notification.findOneAndDelete({ squeal_ref: squeal._id, user_ref: squeal.user_id });
          if (notification) await User.findByIdAndUpdate(squeal.user_id, { $pull: { notifications: notification._id } });
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
            content: officialNotification(squealOwner.username, squeal.content, addedChannel.name),
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
  let added = newArray.filter((element) => !oldArray.includes(element));
  let removed = oldArray.filter((element) => !newArray.includes(element));
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
  verifyToken,
  generateToken,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  emailRegex,
  reactionTypes,
};
