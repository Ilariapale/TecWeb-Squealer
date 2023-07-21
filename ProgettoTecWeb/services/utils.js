const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

const securityLvl = 10;

//middleware for token verification
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Token mancante." });
  }
  jwt.verify(token, "chiave_segreta", (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: "Token non valido o scaduto." });
    }
    req.userId = decodedToken.userId;
    next();
  });
}

//FINDERS
async function findUser(identifier) {
  let response = {};
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await User.findById(identifier);
  } else if (usernameRegex.test(identifier)) {
    //it's a username
    response.data = await User.findOne({ username: identifier });
  } else {
    response.error = "Invalid identifier";
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
  let response = {};
  if (mongooseObjectIdRegex.test(identifier)) {
    //it's a mongoose ObjectId
    response.data = await Squeal.findById(identifier);
  } else {
    response.error = "Invalid identifier";
    response.status = 400;
    return response;
  }
  if (!response.data) {
    response.error = "Squeal not found";
    response.status = 404;
  } else {
    response.error = "";
    response.status = 200;
  }
  return response;
}

async function findChannel(identifier) {
  let response = {};
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
  if (!response.data || response.data?.isBlocked) {
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

module.exports = {
  jwt,
  bcrypt,
  verifyToken,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  emailRegex,
};
