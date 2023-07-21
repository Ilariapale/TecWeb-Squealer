const mongoose = require("mongoose");
const {
  Notification,
  User,
  Squeal,
  Channel,
  Keyword,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
} = require("./schemas");
module.exports = {
  /**
   * Retrieve squeals with optional filters
   * @param options.contentType Filter squeals by content type (text, image, video, position)
   * @param options.createdAfter Filter squeals created after the specified date
   * @param options.createdBefore Filter squeals created before the specified date
   * @param options.isScheduled Filter squeals by scheduled status
   * @param options.minReactions Filter squeals with more than n total reactions
   */
  getSqueals: async (options) => {
    //TODO ogni volta che faccio una get di uno squeal devo incrementare il numero di impressions
    //TODO le reaction sono solo un numero, non un array di users

    const pipeline = [];

    //TODO controllare che le date siano valide
    if (options.contentType) {
      pipeline.push({ $match: { content_type: options.contentType } });
    }

    //check if the request has specified createdAfter or createdBefore
    if (options.createdAfter) {
      pipeline.push({ $match: { created_at: { $gte: new Date(options.createdAfter) } } });
    }

    if (options.createdBefore) {
      pipeline.push({ $match: { created_at: { $lte: new Date(options.createdBefore) } } });
    }
    //check if the request has specified isScheduled
    if (options.isScheduled) {
      pipeline.push({ $match: { is_scheduled: options.isScheduled } });
    }

    //check if the request has specified minReactions
    if (options.minReactions) {
      if (options.minReactions < 0) {
        //return an error if the minReactions is negative
        return {
          status: 400,
          data: { error: "minReactions must be a positive integer" },
        };
      } else {
        pipeline.push({ $match: { reactions: { $exists: true, $expr: { $gte: { $size: "$reactions" }, $gte: options.minReactions } } } });
      }
    }

    //execute the query
    const data = await Squeal.aggregate(pipeline).exec();
    //check if the query returned any result
    if (data.length > 0) {
      return {
        status: 200,
        data: data,
      };
    } else {
      //otherwise return an error
      return {
        status: 404,
        data: { error: "No squeal found." },
      };
    }
  },

  /**
   * @param options.squealInput.user_id Squeal creator's id
   * @param options.squealInput.content_type Type of the squeal content, it can be "text", "image", "video" or "position"
   * @param options.squealInput.content Squeal content based on the content_type, fill it in content.text, an content.image, content.video or content.position
   * @param options.squealInput.is_scheduled It tells you whether or not the squeal is scheduled
   * @param options.squealInput.recipients Array of users, channels or keywords, with no limit and no impact on the quota.
   */
  createSqueal: async (options) => {
    //TODO aggiungere lo squeal ai destinatari: User.squeals.mentionedIn
    var { user_id, content_type, content, is_scheduled, recipients } = options.squealInput;
    const validContentTypes = ["text", "image", "video", "position", "deleted"];

    //set the default value for content_type
    content_type = content_type || "text";
    //check if the content_type is valid
    if (!validContentTypes.includes(content_type)) {
      return {
        status: 400,
        data: { error: "Invalid content_type." },
      };
    }

    //check if the content is specified and correctly formatted
    if (!content) {
      return {
        status: 400,
        data: { error: "Missing 'content' parameter." },
      };
    }

    //check if the recipients are specified
    if (!recipients) {
      return {
        status: 400,
        data: { error: "Missing 'recipients' parameter." },
      };
    }

    var { users, channels, keywords } = JSON.parse(recipients);
    users = users || [];
    channels = channels || [];
    keywords = keywords || [];

    //CHECK FOR USERS
    const userPromises = users.map((user) => {
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

    if (!allUserExist) {
      return {
        status: 404,
        data: { error: "One or more users not found." },
      };
    }

    //CHECK FOR CHANNELS
    const channelPromises = channels.map((channel) => {
      let query;
      if (mongooseObjectIdRegex.test(channel)) {
        query = { _id: channel };
      } else if (channelNameRegex.test(channel)) {
        query = { name: channel };
      } else {
        return false;
      }
      return Channel.exists(query);
    });

    const channelResults = await Promise.all(channelPromises);
    const allChannelExist = channelResults.every((exists) => exists); // true if all channels exist

    if (!allChannelExist) {
      return {
        status: 404,
        data: { error: "One or more channels not found." },
      };
    }

    //CHECK FOR THE USER_ID OF THE AUTHORS
    if (!user_id) {
      return {
        status: 400,
        data: { error: "Missing 'user_id' parameter." },
      };
    }

    //check in the db if the user_id is valid
    let userExists;
    if (user_id.length == 24 && mongoose.isValidObjectId(user_id)) {
      userExists = await User.findById(user_id);
    } else if (user_id.length >= 4 && user_id.length <= 20) {
      userExists = await User.findOne({ username: user_id });
    } else {
      return {
        status: 400,
        data: { error: "Invalid 'user_id' parameter." },
      };
    }
    if (!userExists) {
      return {
        status: 404,
        data: { error: "User not found." },
      };
    } //else we have a valid user_id, and we can refer to it as userExists._id

    //create the hex_id from the length of the user squeals array
    hex_id = userExists?.squeals?.posted?.length || 0;

    const newSqueal = new Squeal({
      hex_id: hex_id,
      user_id: userExists._id,
      is_scheduled: is_scheduled || false,
      content_type: content_type,
      content: content,
      recipients: {
        users: userResults,
        channels: channelResults,
        keywords: keywords,
      },
      created_at: new Date(),
    });

    //save the squeal in the db
    let result = await newSqueal.save();

    //push the squeal in the user squeals array
    await User.findByIdAndUpdate(result.user_id, { $push: { "squeals.posted": result._id } });

    //push the squeal in the users squeals.mentionedIn array
    const userUpdatePromises = [];
    for (const user of userResults) {
      let promise = User.findByIdAndUpdate(user, { $push: { "squeals.mentionedIn": result._id } });
      userUpdatePromises.push(promise);
    }
    await Promise.all(userUpdatePromises);

    //push the squeal in the channels squeals array
    const channelUpdatePromises = [];
    for (const channel of channelResults) {
      let promise = Channel.findByIdAndUpdate(channel._id, { $push: { squeals: result._id } });
      channelUpdatePromises.push(promise);
    }
    await Promise.all(channelUpdatePromises);

    //push the squeal in the keywords squeals array
    const promises = keywords.map(async (keyword) => {
      const existingKeyword = await Keyword.findOne({ name: keyword });

      if (existingKeyword) {
        existingKeyword.squeals.push(result._id);
        await existingKeyword.save();
      } else {
        const newKeyword = new Keyword({
          name: keyword,
          squeals: [result._id],
          created_at: new Date(),
        });
        await newKeyword.save();
      }
    });

    await Promise.all(promises);

    return {
      status: result ? 201 : 400,
      data: result ? { squeal: result } : { error: "Failed to create squeal" },
    };
  },

  /**
   * Get a squeal object by ID or by id, or squeal HEX
   * @param options.identifier Squeal's identifier, can be either id
   */
  getSqueal: async (options) => {
    const { identifier } = options;

    //check if the identifier is specified
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Missing 'identifier' parameter." },
      };
    }

    let data;
    //check if the identifier is a valid ObjectId
    if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
      data = await Squeal.findById(identifier);
    } else {
      return {
        status: 400,
        data: { error: "Invalid 'identifier' parameter." },
      };
    }
    if (data) {
      return {
        status: 200,
        data: data,
      };
    } else {
      return {
        status: 404,
        data: { error: "Squeal not found." },
      };
    }
  },

  /**
   *
   * @param options.identifier Squeal's identifier, can be either id
   */
  deleteSqueal: async (options) => {
    //TODO decidere se eliminare i destinatari e o i canali
    const replaceString = "[deleted squeal]";
    const { identifier } = options;
    let data;
    //check if the identifier is specified
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Missing 'identifier' parameter." },
      };
    }

    if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
      data = await Squeal.findById(identifier);
    } else {
      return {
        status: 400,
        data: { error: "Invalid 'identifier' parameter." },
      };
    }

    if (!data) {
      return {
        status: 404,
        data: { error: "Squeal not found." },
      };
    }

    //Remove the squeal from the every reference

    //data.user_id stays the same

    //1) data.recipients.users are the target users and I have to remove the squeal from each user.squeals.mentionedIn
    const userUpdatePromises = [];

    for (const user of data.recipients.users) {
      let promise = User.findByIdAndUpdate(user, { $pull: { "squeals.mentionedIn": data._id } });
      userUpdatePromises.push(promise);
    }
    await Promise.all(userUpdatePromises);

    //2) data.recipients.channels are the target channels and I have to remove the squeal from each channel.squeals

    const channelUpdatePromises = [];

    for (const channel of data.recipients.channels) {
      let promise = Channel.findByIdAndUpdate(channel, { $pull: { squeals: data._id } });
      channelUpdatePromises.push(promise);
    }
    await Promise.all(channelUpdatePromises);

    //3) data.recipients.keywords sono le keywords destinatarie e devo rimuovere lo squeal da ogni keyword.squeals

    const keywordUpdatePromises = [];

    for (const keyword of data.recipients.keywords) {
      let promise = Keyword.findOneAndUpdate({ name: keyword }, { $pull: { squeals: data._id } });
      keywordUpdatePromises.push(promise);
    }
    await Promise.all(keywordUpdatePromises);

    data = await Squeal.findByIdAndUpdate(identifier, {
      $set: { content_type: "deleted", content: replaceString },
      $set: { "recipients.users": [] },
      $set: { "recipients.channels": [] },
      $set: { "recipients.keywords": [] },
    });

    //4) cancello le notifiche che avevano come squeal_ref lo squeal cancellato
    await Notification.deleteMany({ squeal_ref: identifier });

    return {
      status: 200,
      data: data,
    };
  },

  /**
   * @param options.identifier Squeal's id
   * @param options.updateSquealInlineReqJson.recipients Array of users and channels (no keywords allowed)
   * @param options.updateSquealInlineReqJson.reactions
   */
  updateSqueal: async (options) => {
    //TODO
    const { identifier } = options;
    const { recipients, reactions } = options.updateSquealInlineReqJson;

    //check if the identifier is specified
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Missing 'identifier' parameter." },
      };
    }

    //check if the squeal exists
    let squealExists;
    if (mongooseObjectIdRegex.test(identifier)) {
      squealExists = await Squeal.findById(identifier);
    } else {
      return {
        status: 400,
        data: { error: "Invalid 'identifier' parameter." },
      };
    }

    if (!squealExists) {
      return {
        status: 404,
        data: { error: "Squeal not found." },
      };
    }

    //check if the recipients are specified
    if (recipients) {
      //replace the old recipients with the new ones
      const { users, channels } = JSON.parse(recipients);
      squealExists.recipients.users = users || [];
      squealExists.recipients.channels = channels || [];
    }

    if (reactions) {
      //replace the old reaction numbers with the new ones
      squealExists.reactions.like = reactions.like || squealExists.reactions.like;
      squealExists.reactions.love = reactions.love || squealExists.reactions.love;
      squealExists.reactions.laugh = reactions.laugh || squealExists.reactions.laugh;
      squealExists.reactions.dislike = reactions.dislike || squealExists.reactions.dislike;
      squealExists.reactions.disgust = reactions.disgust || squealExists.reactions.disgust;
      squealExists.reactions.disagree = reactions.disagree || squealExists.reactions.disagree;
    }

    //save the squeal in the db
    let result = await squealExists.save();

    return {
      status: result ? 200 : 400,
      data: result ? { squeal: result } : { error: "Failed to update squeal" },
    };
  },
};
