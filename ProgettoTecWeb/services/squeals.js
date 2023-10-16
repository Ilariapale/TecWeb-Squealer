const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const {
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  reactionTypes,
  contentTypes,
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

const { mentionNotification, squealInOfficialChannel } = require("./messages");

//TODO tradurre tutti i commenti in inglese
//TODO quando vengono mandate richieste formattate male, restituire un errore con la descrizione del problema (400 Bad Request)
//TODO notifica quando vieni menzionato in un post
//TODO reagire se non sei autenticato

//DONE Controllati i casi in cui l'utente che fa richiesta è bannato
module.exports = {
  /**
   * Retrieve squeals with optional filters
   * @param options.content_type Filter squeals by content type (text, image, video, position)
   * @param options.created_after Filter squeals created after the specified date
   * @param options.created_before Filter squeals created before the specified date
   * @param options.is_scheduled Filter squeals by scheduled status
   * @param options.min_reactions Filter squeals with more than n total reactions
   * @param options.min_balance Filter squeals with more than n balance
   * @param options.max_balance Filter squeals with less than n balance
   * @param options.is_in_official_channel Filter squeals by official channel status
   * @param options.sort_order Sorts squeals, can be either "asc" or "desc"
   * @param options.sort_by Can be "impressions", "reactions", "date", "comments"
   */
  //TODO comments_count non esiste ancora
  getSqueals: async (options) => {
    const { content_type, created_after, created_before, is_scheduled, min_reactions, min_balance, max_balance, is_in_official_channel, sort_order, sort_by } = options;
    const sort_types = ["reactions", "comments", "impressions", "date"];
    const sort_orders = ["asc", "desc"];
    const pipeline = [];
    if (content_type) {
      if (!contentTypes.includes(content_type)) {
        return {
          status: 400,
          data: { error: `Invalid content_type.` },
        };
      }
      pipeline.push({ $match: { content_type: content_type } });
    }

    //check if the request has specified created_after or created_before
    if (created_after) {
      const date = Date.parse(created_after);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: `Invalid date format.` },
        };
      }
      pipeline.push({ $match: { created_at: { $gte: new Date(date) } } });
    }
    if (created_before) {
      const date = Date.parse(created_before);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: `Invalid date format.` },
        };
      }
      pipeline.push({ $match: { created_at: { $lte: new Date(date) } } });
    }

    //check if the request has specified is_scheduled
    if (is_scheduled) {
      if (!["true", "false"].includes(is_scheduled))
        return {
          status: 400,
          data: { error: `Invalid is_scheduled value. Must be either "true" or "false".` },
        };

      pipeline.push({ $match: { is_scheduled: is_scheduled == "true" ? true : false } });
    }

    //check if the request has specified is_in_official_channel
    if (is_in_official_channel) {
      pipeline.push({ $match: { is_in_official_channel: is_in_official_channel } });
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
        reactions: {
          reactions_count: { $add: ["$reactions.positive_reactions", "$reactions.negative_reactions"] },
          balance: { $subtract: ["$reactions.positive_reactions", "$reactions.negative_reactions"] },
          positive_reactions: "$reactions.positive_reactions",
          negative_reactions: "$reactions.negative_reactions",
        },
      },
    });

    let intMinBalance;

    if (min_balance) {
      const balance = parseInt(min_balance);
      if (isNaN(balance)) {
        //return an error if the balance is not a number
        return {
          status: 400,
          data: { error: `"min_balance" must be a number.` },
        };
      }
      intMinBalance = balance;
      pipeline.push({ $match: { "reactions.balance": { $gte: balance } } });
    }

    if (max_balance) {
      const balance = parseInt(max_balance);
      if (isNaN(balance)) {
        //return an error if the balance is not a number
        return {
          status: 400,
          data: { error: `"balance" must be a number.` },
        };
      }
      if (intMinBalance && balance < intMinBalance) {
        //return an error if the max_balance is less than the min_balance
        return {
          status: 400,
          data: { error: `"max_balance" must be greater than "min_balance".` },
        };
      }
      pipeline.push({ $match: { "reactions.balance": { $lte: balance } } });
    }

    //check if the request has specified min_reactions
    if (min_reactions) {
      const minReactions = parseInt(min_reactions);
      if (isNaN(minReactions)) {
        //return an error if the min_reactions is not a number
        return {
          status: 400,
          data: { error: `"min_reactions" must be a positive integer` },
        };
      }
      pipeline.push({ $match: { reactions_count: { $gte: minReactions } } });
    }

    if ((sort_order && !sort_by) || (!sort_order && sort_by)) {
      return {
        status: 400,
        data: { error: `Missing 'sort_order' or 'sort_by' parameter.` },
      };
    }

    if (sort_order && sort_by) {
      if (!sort_orders.includes(sort_order) || !sort_types.includes(sort_by)) {
        return {
          status: 400,
          data: { error: `Invalid 'sort_order' or 'sort_by'. 'sort_by' options are '${sort_types.join("', '")}. 'sort_order' options are '${sort_orders.join("', '")}'.` },
        };
      }
      const order = sort_order == "asc" ? 1 : -1;
      if (sort_by == "reactions") pipeline.push({ $sort: { "reactions.reactions_count": order } });
      else if (sort_by == "comments") pipeline.push({ $sort: { comments_count: order } });
      else if (sort_by == "impressions") pipeline.push({ $sort: { impressions: order } });
      else if (sort_by == "date") pipeline.push({ $sort: { created_at: order } });
    }

    //execute the query
    const data = await Squeal.aggregate(pipeline).exec();

    //check if the query returned any result
    if (data.length <= 0) {
      return {
        status: 404,
        data: { error: `No squeal found.` },
      };
    }

    //if the query returned some results, increment the impressions counter for each squeal
    const squealImpressionsPromises = [];

    for (let squeal of data) {
      squealImpressionsPromises.push(Squeal.findByIdAndUpdate(squeal._id, { $inc: { impressions: 1 } }));
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
  //TESTED
  getSqueal: async (options) => {
    const { identifier, is_in_official_channel, user_identifier, squeal_hex } = options;
    let squeal;
    if (identifier) {
      //ricerca per id dello squeal
      const response = await findSqueal(identifier, is_in_official_channel);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      squeal = response.data;
    } else if (user_identifier && squeal_hex) {
      //ricerca per idUser e hex
      const hex = parseInt(squeal_hex);
      const response = await findUser(user_identifier);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const user = response.data;

      if (hex == NaN || hex >= user.squeals.posted.length) {
        return {
          status: 404,
          data: { error: `Squeal not found.` },
        };
      }
      console.log(is_in_official_channel);
      const squeal_response = await findSqueal(user.squeals.posted[hex], is_in_official_channel);
      if (squeal_response.status >= 300) {
        return {
          status: squeal_response.status,
          data: { error: squeal_response.error },
        };
      }
      squeal = squeal_response.data;
    }

    //impressions increment with save()
    squeal.impressions++;
    squeal.save();

    return {
      status: 200,
      data: squeal,
    };
  },

  /**
   * @param options.squealInput.user_id Request sender's user id
   * @param options.squealInput.content_type Type of the squeal content, it can be "text", "image", "video" or "position"
   * @param options.squealInput.content Squeal content based on the content_type, fill it in content.text, an content.image, content.video or content.position
   * @param options.squealInput.is_scheduled It tells you whether or not the squeal is scheduled
   * @param options.squealInput.recipients Array of users, channels or keywords, with no limit and no impact on the quota.
   */
  //TODO DA TESTARE
  createSqueal: async (options) => {
    try {
      //vietare di postare in un canale ufficiale
      const { user_id, vip_id, content, recipients } = options.squealInput;

      //set the default value for content_type
      const content_type = options.squealInput.content_type || "text";
      const is_scheduled = options.squealInput.is_scheduled == "true" ? true : options.squealInput.is_scheduled == "false" ? false : undefined;

      //check for the request sender's id
      let response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const reqSender = response.data;

      //check in the db if the vip_id is valid
      let vip_user;
      if (vip_id) {
        response = await findUser(vip_id);
        if (response.status >= 300) {
          return {
            status: response.status,
            data: { error: response.error },
          };
        }
        vip_user = response.data;
      }

      //abbiamo sicuramente un reqSender valido
      //forse c'è anche un vip_user che puo' essere undefined o un utente valido

      //author is the reqSender by default
      var author = reqSender;

      if (vip_user && !reqSender._id.equals(vip_user._id)) {
        //Sto cercando di postare a nome di qualcun altro
        //quindi controllo se l'utente che manda la richiesta ha i permessi per farlo, ovvero è un SMM di un utente VIP
        if (reqSender.account_type != "professional" || reqSender.professional_type != "smm") {
          return {
            status: 403,
            data: { error: `You are not allowed to post as another user.` },
          };
        }
        //altrimenti controllo se hai i permessi per postare a nome di un utente VIP
        if (!reqSender._id.equals(vip_user.smm)) {
          return {
            status: 403,
            data: { error: `You are not allowed to post as this user.` },
          };
        }

        //here I know that the reqSender is a SMM of the user, so I can post as the user
        author = vip_user;
        console.log(reqSender.is_active);
        console.log(vip_user.is_active);
        if (!reqSender.is_active || !vip_user.is_active) {
          return {
            status: 403,
            data: { error: `Either the vip or the smm is banned and they are not allowed to post a squeal.` },
          };
        }
      }

      //check if the content_type is valid
      if (!contentTypes.includes(content_type) || content_type == "deleted") {
        return {
          status: 400,
          data: { error: `Invalid content_type.` },
        };
      }

      //check if the content is specified and correctly formatted
      if (!content || content?.length == 0) {
        return {
          status: 400,
          data: { error: `Missing 'content' parameter.` },
        };
      }

      //check if the recipients are specified
      if (!recipients) {
        return {
          status: 400,
          data: { error: `Missing 'recipients' parameter.` },
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
          data: { error: `One or more channels not found: ` + notFound.join(", ") + `.` },
        };
      }

      //check if the user is trying to post in an official channel
      const hasOfficialChannels = await containsOfficialChannels(channelsArray);
      if (hasOfficialChannels && author.account_type != "moderator") {
        return {
          status: 403,
          data: { error: `You are not allowed to post in an official channel.` },
        };
      }

      //CHECK FOR USERS
      const { usersOutcome, usersArray } = await checkForAllUsers(users);
      if (!usersOutcome) {
        return {
          status: 404,
          data: { error: `One or more users not found.` },
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
        //send a notification to the mentioned user
        console.log(mentionNotification(author.username, content));
        const notification = new Notification({
          user_ref: user,
          squeal_ref: result._id,
          content: mentionNotification(author.username, content),
          created_at: new Date(),
          source: "squeal",
        });
        await notification.save();

        let promise = User.findByIdAndUpdate(user, { $push: { "squeals.mentioned_in": result._id }, $push: { notifications: notification._id } });
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
        data: result ? result : { error: `Failed to create squeal` },
      };
    } catch (error) {
      console.log(error);
    }
  },

  /**
   * @param options.identifier Squeal's identifier, can be either id
   */
  deleteSqueal: async (options) => {
    // const replaceString = "[deleted squeal]";
    // const deleted_content_type = "deleted";
    const { identifier, user_id } = options;

    let response = await findSqueal(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

    //check if the user_id in the token is valid
    response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let reqSender = response.data;

    const isSenderAuthor = reqSender._id.equals(squeal.user_id);
    const isModerator = reqSender.account_type == "moderator";
    const isSMM = reqSender.account_type == "professional" && reqSender.professional_type == "SMM" && reqSender._id.equals(squealAuthor.smm);

    if (!isSenderAuthor && !isModerator && !isSMM) {
      return {
        status: 403,
        data: { error: `You are not allowed to delete this squeal.` },
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
        data: { error: `Missing 'reaction' parameter.` },
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
        data: { error: `You're not allowed to react to a squeal while banned` },
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
    if (squeal.content_type == "deleted") {
      return {
        status: 403,
        data: { error: `You're not allowed to react to a deleted squeal` },
      };
    }
    //check if the reaction is valid
    if (!reactionTypes.includes(reaction)) {
      return {
        status: 400,
        data: { error: `Invalid reaction type.` },
      };
    }
    //check if the user already reacted to the squeal
    if (user.squeals.reacted_to.includes(squeal._id)) {
      return {
        status: 400,
        data: { error: `User already reacted to this squeal.` },
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
   * @param options.inlineReqJson.recipients Array of users and channels (no keywords allowed)
   * @param options.inlineReqJson.reactions Array like {like: 0, love: 0, laugh: 0, dislike: 0, disgust: 0, disagree: 0}
   */
  updateSqueal: async (options) => {
    try {
      const { identifier, user_id } = options;
      const recipients = options.inlineReqJson.recipients ? JSON.parse(options.inlineReqJson?.recipients) : undefined;
      const reactions = options.inlineReqJson.reactions ? JSON.parse(options.inlineReqJson?.reactions) : undefined;
      if (!identifier) {
        return {
          status: 400,
          data: { error: `Missing 'identifier' parameter.` },
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
          data: { error: `You are not allowed to update this squeal.` },
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
          data: { error: `Missing 'recipients' or 'reactions' parameter.` },
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
        squeal.is_in_official_channel = (channelsResponse.data.channelsArray || []).some((channel) => channel.is_official);
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

      //UPDATE REACTIONS
      if (reactions) {
        const { like, love, laugh, dislike, disgust, disagree } = parseInt(reactions);
        if (isNaN(like) || isNaN(love) || isNaN(laugh) || isNaN(dislike) || isNaN(disgust) || isNaN(disagree)) {
          return {
            status: 400,
            data: { error: `Reactions must be integers.` },
          };
        }
        like ? (squeal.reactions.positive_reactions.like = like) : null;
        love ? (squeal.reactions.positive_reactions.love = love) : null;
        laugh ? (squeal.reactions.positive_reactions.laugh = laugh) : null;
        dislike ? (squeal.reactions.negative_reactions.dislike = dislike) : null;
        disgust ? (squeal.reactions.negative_reactions.disgust = disgust) : null;
        disagree ? (squeal.reactions.negative_reactions.disagree = disagree) : null;
      }

      squeal.last_modified = new Date();
      const updatedSqueal = await squeal.save();
      return {
        status: updatedSqueal ? 200 : 400,
        data: updatedSqueal ? updatedSqueal : { error: `Failed to update squeal` },
      };
    } catch (error) {
      console.log(error);
    }
  },
};
