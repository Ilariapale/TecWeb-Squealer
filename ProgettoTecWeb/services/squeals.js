const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const {
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  reactionTypes,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
  checkForAllUsers,
  checkForAllChannels,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
} = require("./utils");

//TODO gestire tutti i casi in cui l'utente è bannato
//TODO creare e/o spostare uno squeal in un canale ufficiale
module.exports = {
  /**
   * Retrieve squeals with optional filters
   * @param options.contentType Filter squeals by content type (text, image, video, position)
   * @param options.createdAfter Filter squeals created after the specified date
   * @param options.createdBefore Filter squeals created before the specified date
   * @param options.isScheduled Filter squeals by scheduled status
   * @param options.minReactions Filter squeals with more than n total reactions
   * @param options.isInOfficialChannel Filter squeals by official channel status
   */
  getSqueals: async (options) => {
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
      pipeline.push({ $match: { is_scheduled: true } });
    }

    //check if the request has specified isInOfficialChannel
    if (options.isInOfficialChannel) {
      pipeline.push({ $match: { is_in_official_channel: true } });
    }

    if (pipeline.length == 0) {
      pipeline.push({ $match: {} });
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
      //if the query returned some results, increment the impressions counter for each squeal
      const squealImpressionsPromises = [];

      for (const squeal of data) {
        let promise = squeal.save();
        squealImpressionsPromises.push(promise);
      }
      await Promise.all(squealImpressionsPromises);

      //return the squeals
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
   * Get a squeal object by ID or by id, or squeal HEX
   * @param options.identifier Squeal's identifier, can be either id
   * @param options.isInOfficialChannel It tells you whether the channel is official or not
   */
  getSqueal: async (options) => {
    const { identifier, isInOfficialChannel } = options;

    const squeal = await findSqueal(identifier);
    if (squeal.status >= 300) {
      return {
        status: squeal.status,
        data: { error: squeal.error },
      };
    }
    if (squeal.data.is_in_official_channel == isInOfficialChannel || isInOfficialChannel == false) {
      squeal.data.impressions++;
      await squeal.data.save();
      return {
        status: 200,
        data: squeal.data,
      };
    }
    return {
      status: 404,
      data: { error: "Squeal not found." },
    };
  },

  /**
   * @param options.squealInput.sender_id Request sender's user id
   * @param options.squealInput.user_id Squeal author's user id, if you're posting as another user
   * @param options.squealInput.content_type Type of the squeal content, it can be "text", "image", "video" or "position"
   * @param options.squealInput.content Squeal content based on the content_type, fill it in content.text, an content.image, content.video or content.position
   * @param options.squealInput.is_scheduled It tells you whether or not the squeal is scheduled
   * @param options.squealInput.recipients Array of users, channels or keywords, with no limit and no impact on the quota.
   */
  createSqueal: async (options) => {
    //vietare di postare in un canale ufficiale
    var { sender_id, user_id, content_type, content, is_scheduled, recipients } = options.squealInput;

    //set the default value for content_type
    content_type = content_type || "text";

    const validContentTypes = ["text", "image", "video", "position", "deleted"];

    //check for the request sender's id
    let response = await findUser(sender_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const reqSender = response.data;

    //check in the db if the user_id is valid
    if (user_id) {
      response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
    }
    const user = response.data;

    //author is the reqSender by default
    var author = reqSender;

    if (user_id && !reqSender._id.equals(user._id)) {
      //Sto cercando di postare a nome di qualcun altro
      //quindi controllo se l'utente che manda la richiesta ha i permessi per farlo, ovvero è un SMM di un utente VIP
      if (reqSender.account_type != "professional" || reqSender.professional_type != "smm") {
        return {
          status: 403,
          data: { error: "You are not allowed to post as another user." },
        };
      }
      //altrimenti controllo se hai i permessi per postare a nome di un utente VIP
      if (!reqSender._id.equals(user.smm)) {
        return {
          status: 403,
          data: { error: "You are not allowed to post as this user." },
        };
      }

      //here I know that the reqSender is a SMM of the user, so I can post as the user
      author = user;
    }

    //check if the user is active or not
    if (!author.is_active) {
      return {
        status: 403,
        data: { error: "This user is banned" },
      };
    }

    //check if the content_type is valid
    if (!validContentTypes.includes(content_type)) {
      return {
        status: 400,
        data: { error: "Invalid content_type." },
      };
    }

    //check if the content is specified and correctly formatted
    if (!content || content?.length == 0) {
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

    //check if the user has enough char_quota
    const enoughQuota = hasEnoughCharQuota(author, content_type, content);
    if (!enoughQuota.outcome) {
      return {
        status: 403,
        data: { error: enoughQuota.reason },
      };
    }

    //CHECK FOR USERS
    const { usersOutcome, usersArray } = await checkForAllUsers(users);
    if (!usersOutcome) {
      return {
        status: 404,
        data: { error: "One or more users not found." },
      };
    }

    //CHECK FOR CHANNELS
    const { channelsOutcome, channelsArray } = await checkForAllChannels(channels);
    if (!channelsOutcome) {
      return {
        status: 404,
        data: { error: "One or more channels not found." },
      };
    }

    //create the hex_id from the length of the user squeals array
    hex_id = author.squeals?.posted?.length || 0;

    //create the squeal object
    const newSqueal = new Squeal({
      hex_id: hex_id,
      user_id: author._id,
      is_scheduled: is_scheduled || false,
      content_type: content_type,
      content: content,
      recipients: {
        users: usersArray,
        channels: channelsArray,
        keywords: keywords,
      },
      created_at: new Date(),
      last_modified: new Date(),
    });

    //save the squeal in the db
    let result = await newSqueal.save();

    //remove the char_quota from the user
    await removeQuota(author, enoughQuota.quotaToSubtract);
    //subtract the squeal length from the user's char_quota

    //push the squeal in the user squeals array
    author.squeals.posted.push(result._id);
    await author.save();

    //push the squeal in the users squeals.mentionedIn array
    const userUpdatePromises = [];
    for (const user of usersArray) {
      let promise = User.findByIdAndUpdate(user, { $push: { "squeals.mentionedIn": result._id } });
      userUpdatePromises.push(promise);
    }
    await Promise.all(userUpdatePromises);

    //push the squeal in the channels squeals array
    const channelUpdatePromises = [];
    for (const channel of channelsArray) {
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
      data: result ? result : { error: "Failed to create squeal" },
    };
  },

  /**
   * @param options.identifier Squeal's identifier, can be either id
   * @param options.user_id Request sender's user id
   */
  deleteSqueal: async (options) => {
    const replaceString = "[deleted squeal]";
    const { identifier } = options;

    let data = await findSqueal(identifier);
    if (data.status >= 300) {
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    let squeal = data.data;

    //check if the user_id in the token is valid
    data = await findUser(options.user_id);
    if (data.status >= 300) {
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    let reqSender = data.data;

    //check if the user is the author of the squeal
    data = await findUser(squeal.user_id);
    if (data.status >= 300) {
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    let squealAuthor = data.data;

    let isSenderAuthor = reqSender._id == squealAuthor._id;
    let isModerator = reqSender.account_type == "moderator";
    let isSMM = reqSender.account_type == "professional" && reqSender.professional_type == "smm" && reqSender._id.equals(squealAuthor.smm);

    if (!isSenderAuthor && !isModerator && !isSMM) {
      return {
        status: 403,
        data: { error: "You are not allowed to delete this squeal." },
      };
    }

    //1) squeal.recipients.users are the target users and I have to remove the squeal from each user.squeals.mentionedIn
    const userUpdatePromises = [];

    for (const user of squeal.recipients.users) {
      let promise = User.findByIdAndUpdate(user, { $pull: { "squeals.mentionedIn": squeal._id } });
      userUpdatePromises.push(promise);
    }
    await Promise.all(userUpdatePromises);

    //2) squeal.recipients.channels are the target channels and I have to remove the squeal from each channel.squeals

    const channelUpdatePromises = [];

    for (const channel of squeal.recipients.channels) {
      let promise = Channel.findByIdAndUpdate(channel, { $pull: { squeals: squeal._id } });
      channelUpdatePromises.push(promise);
    }
    await Promise.all(channelUpdatePromises);

    //3) squeal.recipients.keywords sono le keywords destinatarie e devo rimuovere lo squeal da ogni keyword.squeals

    const keywordUpdatePromises = [];

    for (const keyword of squeal.recipients.keywords) {
      let promise = Keyword.findOneAndUpdate({ name: keyword }, { $pull: { squeals: squeal._id } });
      keywordUpdatePromises.push(promise);
    }
    await Promise.all(keywordUpdatePromises);

    squeal.content_type = "deleted";
    squeal.content = replaceString;
    squeal.recipients.users = [];
    squeal.recipients.channels = [];
    squeal.recipients.keywords = [];
    squeal.last_modified = new Date();
    await squeal.save();

    //4) cancello le notifiche che avevano come squeal_ref lo squeal cancellato
    await Notification.deleteMany({ squeal_ref: identifier });

    return {
      status: 200,
      data: squeal,
    };
  },

  /**
   * @param options.identifier
   * @param options.user_id
   * @param options.reaction
   */
  addReaction: async (options) => {
    const { identifier, reaction, user_id } = options;

    if (!reaction) {
      return {
        status: 400,
        data: { error: "Missing 'reaction' parameter." },
      };
    }

    //check if the user_id is specified
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    //check if the identifier is specified
    response = await findSqueal(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

    //check if the reaction is valid
    if (!reactionTypes.includes(reaction)) {
      return {
        status: 400,
        data: { error: "Invalid reaction type." },
      };
    }

    //check if the user already reacted to the squeal
    if (user.squeals.reactedTo.includes(squeal._id)) {
      return {
        status: 400,
        data: { error: "User already reacted to this squeal." },
      };
    }

    //add the reaction to the squeal
    squeal.reactions[reaction]++;
    squeal.save();

    //add the squeal to the user squeals.reactedTo
    user.squeals.reactedTo.push(squeal._id);
    await user.save();

    return {
      status: 200,
      data: squeal,
    };
  },

  /**
   * @param options.identifier Squeal's id
   * @param options.updateSquealInlineReqJson.recipients Array of users and channels (no keywords allowed)
   * @param options.updateSquealInlineReqJson.reactions Array like {like: 0, love: 0, laugh: 0, dislike: 0, disgust: 0, disagree: 0}
   * @param options.user_id Request sender's user id
   */
  updateSqueal: async (options) => {
    //TODO
    try {
      const { identifier, user_id } = options;
      const recipients = options.updateSquealInlineReqJson.recipients ? JSON.parse(options.updateSquealInlineReqJson?.recipients) : undefined;
      const reactions = options.updateSquealInlineReqJson.reactions ? JSON.parse(options.updateSquealInlineReqJson?.reactions) : undefined;
      if (!identifier) {
        return {
          status: 400,
          data: { error: "Missing 'identifier' parameter." },
        };
      }
      let response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const reqSender = response.data;

      //check if the reqSender is a moderator
      if (reqSender.account_type != "moderator") {
        return {
          status: 403,
          data: { error: "You are not allowed to update this squeal." },
        };
      }

      //check if the squeal exists
      let data = await findSqueal(identifier);
      if (data.status >= 300) {
        return {
          status: data.status,
          data: { error: data.error },
        };
      }
      const squeal = data.data;

      if (!recipients && !reactions) {
        return {
          status: 400,
          data: { error: "Missing 'recipients' or 'reactions' parameter." },
        };
      }
      if (recipients) {
        const { users, channels, keywords } = recipients;

        //UPDATE USERS
        let usersResponse = await updateRecipientsUsers(users, squeal);
        if (usersResponse.status >= 300) {
          return {
            status: usersResponse.status,
            data: { error: usersResponse.error },
          };
        }
        squeal.recipients.users = usersResponse.data.usersArray;

        //UPDATE CHANNELS
        let channelsResponse = await updateRecipientsChannels(channels, squeal);
        if (channelsResponse.status >= 300) {
          return {
            status: channelsResponse.status,
            data: { error: channelsResponse.error },
          };
        }
        //check if the squeal is in an official channel
        squeal.is_in_official_channel = (channels || []).some((channel) => channel.is_official);
        squeal.recipients.channels = channelsResponse.data.channelsArray;

        //UPDATE KEYWORDS
        let keywordsResponse = await updateRecipientsKeywords(keywords, squeal);
        if (keywordsResponse.status >= 300) {
          return {
            status: keywordsResponse.status,
            data: { error: keywordsResponse.error },
          };
        }
        squeal.keywords = keywords;
      }

      squeal.last_modified = new Date();
      const updatedSqueal = await squeal.save();
      return {
        status: updatedSqueal ? 200 : 400,
        data: updatedSqueal ? updatedSqueal : { error: "Failed to update squeal" },
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        data: { error: err || "Something went wrong." },
      };
    }
    /*
      const { identifier, user_id } = options;
      const { recipients } = options.updateSquealInlineReqJson;
      const reactions = JSON.parse(options?.updateSquealInlineReqJson?.reactions || "{}") || {};
      //check if the identifier is specified

      let response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const reqSender = response.data;

      //check if the reqSender is a moderator
      if (reqSender.account_type != "moderator") {
        return {
          status: 403,
          data: { error: "You are not allowed to update this squeal." },
        };
      }

      if (!identifier) {
        return {
          status: 400,
          data: { error: "Missing 'identifier' parameter." },
        };
      }

      //check if the squeal exists
      let data = await findSqueal(identifier);
      if (data.status >= 300) {
        return {
          status: data.status,
          data: { error: data.error },
        };
      }
      const squeal = data.data;

      //check if the recipients are specified
      if (recipients) {
        //replace the old recipients with the new ones
        const { users, channels } = JSON.parse(recipients) || [];
        squeal.recipients.users = users || [];
        squeal.recipients.channels = channels || [];
      }

      if (reactions) {
        //replace the old reaction numbers with the new ones
        squeal.reactions.like = reactions.like === undefined ? squeal.reactions.like : reactions.like;
        squeal.reactions.love = reactions.love === undefined ? squeal.reactions.love : reactions.love;
        squeal.reactions.laugh = reactions.laugh === undefined ? squeal.reactions.laugh : reactions.laugh;
        squeal.reactions.dislike = reactions.dislike === undefined ? squeal.reactions.dislike : reactions.dislike;
        squeal.reactions.disgust = reactions.disgust === undefined ? squeal.reactions.disgust : reactions.disgust;
        squeal.reactions.disagree = reactions.disagree === undefined ? squeal.reactions.disagree : reactions.disagree;
      }
      //save the squeal in the db
      let result = await squeal.save();

      return {
        status: result ? 200 : 400,
        data: result ? result : { error: "Failed to update squeal" },
      };
      */
  },
};
