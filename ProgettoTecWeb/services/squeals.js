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
  containsOfficialChannels,
} = require("./utils");
//TODO tradurre tutti i commenti in inglese
//TODO gestire tutti i casi in cui l'utente è bannato
//TODO quando vengono mandate richieste formattate male, restituire un errore con la descrizione del problema (400 Bad Request)
//TODO notifica quando vieni menzionato in un post
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

    //TODO testare
    if (options.contentType) {
      if (!["text", "image", "video", "position"].includes(options.contentType)) {
        return {
          status: 400,
          data: { error: "Invalid content_type." },
        };
      }
      pipeline.push({ $match: { content_type: options.contentType } });
    }

    //check if the request has specified createdAfter or createdBefore
    if (options.createdAfter) {
      const date = Date.parse(options.createdAfter);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: "Invalid date format." },
        };
      }
      pipeline.push({ $match: { created_at: { $gte: new Date(date) } } });
    }
    if (options.createdBefore) {
      const date = Date.parse(options.createdBefore);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: "Invalid date format." },
        };
      }
      pipeline.push({ $match: { created_at: { $lte: new Date(date) } } });
    }

    //check if the request has specified isScheduled
    if (options.isScheduled) {
      if (!["true", "false"].includes(options.isScheduled))
        return {
          status: 400,
          data: { error: `Invalid isScheduled value. Must be either "true" or "false".` },
        };

      pipeline.push({ $match: { is_scheduled: options.isScheduled == "true" ? true : false } });
    }

    //check if the request has specified isInOfficialChannel
    if (options.isInOfficialChannel) {
      if (!["true", "false"].includes(options.isInOfficialChannel))
        return {
          status: 400,
          data: { error: `Invalid isInOfficialChannel value. Must be either "true" or "false".` },
        };
      pipeline.push({ $match: { is_in_official_channel: options.isInOfficialChannel == "true" ? true : false } });
    }

    //PROJECTION
    pipeline.push({
      $project: {
        _id: 1,
        hex_id: 1,
        user_id: 1,
        is_scheduled: 1,
        content_type: 1,
        content: 1,
        recipients: 1,
        created_at: 1,
        last_modified: 1,
        reactions: 1,
        is_in_official_channel: 1,
        impressions: 1,
        reactions_count: { $add: ["$reactions.positive_reactions", "$reactions.negative_reactions"] },
      },
    });

    //check if the request has specified minReactions
    if (options.minReactions) {
      const minReactions = parseInt(options.minReactions);
      if (isNaN(minReactions)) {
        //return an error if the minReactions is not a number
        return {
          status: 400,
          data: { error: "minReactions must be a positive integer" },
        };
      }
      pipeline.push({ $match: { reactions_count: { $gte: minReactions } } });
    }

    if (pipeline.length == 0) {
      pipeline.push({ $match: {} });
    }
    //execute the query
    const data = await Squeal.aggregate(pipeline).exec();

    //check if the query returned any result
    if (data.length <= 0) {
      return {
        status: 404,
        data: { error: "No squeal found." },
      };
    }

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
  },

  /**
   * Get a squeal object by ID, or squeal HEX
   * @param options.identifier Squeal's identifier, can be either id
   */
  getSqueal: async (options) => {
    const { identifier, is_in_official_channel, user_identifier, squeal_hex } = options;
    //TODO implementare la ricerca tramite idUser e hex
    const response = await findSqueal(identifier, is_in_official_channel);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

    //impressions increment with save()
    await squeal.save();

    return {
      status: 200,
      data: squeal,
    };
  },

  /**
   * @param options.squealInput.sender_id Request sender's user id
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

    //CHECK FOR CHANNELS
    const { channelsOutcome, channelsArray, notFound } = await checkForAllChannels(channels);
    if (!channelsOutcome) {
      return {
        status: 404,
        data: { error: "One or more channels not found: " + notFound.join(", ") + "." },
      };
    }

    //check if the user is trying to post in an official channel
    const hasOfficialChannels = await containsOfficialChannels(channelsArray);
    if (hasOfficialChannels && author.account_type != "moderator") {
      return {
        status: 403,
        data: { error: "You are not allowed to post in an official channel." },
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
      is_in_official_channel: hasOfficialChannels,
    });

    //save the squeal in the db
    let result = await newSqueal.save();

    //remove the char_quota from the user
    await removeQuota(author, enoughQuota.quotaToSubtract);
    //subtract the squeal length from the user's char_quota

    //push the squeal in the user squeals array
    author.squeals.posted.push(result._id);
    await author.save();

    //push the squeal in the users squeals.mentioned_in array
    const userUpdatePromises = [];
    for (const user of usersArray) {
      let promise = User.findByIdAndUpdate(user, { $push: { "squeals.mentioned_in": result._id } });
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
    // const replaceString = "[deleted squeal]";
    // const deleted_content_type = "deleted";
    const { identifier } = options;

    let response = await findSqueal(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

    //check if the user_id in the token is valid
    response = await findUser(options.user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let reqSender = response.data;

    //check if the user is the author of the squeal
    response = await findUser(squeal.user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squealAuthor = response.data;

    let isSenderAuthor = reqSender._id.equals(squealAuthor._id);
    let isModerator = reqSender.account_type == "moderator";
    let isSMM = reqSender.account_type == "professional" && reqSender.professional_type == "smm" && reqSender._id.equals(squealAuthor.smm);

    if (!isSenderAuthor && !isModerator && !isSMM) {
      return {
        status: 403,
        data: { error: "You are not allowed to delete this squeal." },
      };
    }
    await squeal.DeleteAndPreserveInDB();

    return {
      status: 200,
      data: squeal,
    };
  },

  /**
   * @param options.identifier
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

    //check if the user is active
    if (user.is_active == false) {
      return {
        status: 403,
        data: { error: "You're not allowed to react to a squeal while banned" },
      };
    }

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
    if (user.squeals.reacted_to.includes(squeal._id)) {
      return {
        status: 400,
        data: { error: "User already reacted to this squeal." },
      };
    }

    //add the reaction to the squeal
    squeal.reactions[reaction]++;
    squeal.save();

    //add the squeal to the user squeals.reacted_to
    user.squeals.reacted_to.push(squeal._id);
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
   */
  updateSqueal: async (options) => {
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
    let squealResponse = await findSqueal(identifier);
    if (squealResponse.status >= 300) {
      return {
        status: squealResponse.status,
        data: { error: squealResponse.error },
      };
    }
    const squeal = squealResponse.data;

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
      squeal.recipients.keywords = keywords;
    }

    squeal.last_modified = new Date();
    const updatedSqueal = await squeal.save();
    return {
      status: updatedSqueal ? 200 : 400,
      data: updatedSqueal ? updatedSqueal : { error: "Failed to update squeal" },
    };
  },
};
