const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, CommentSection } = require("./schemas");
const {
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  reactionTypes,
  contentTypes,
  scheduledSquealsNUM,
  scheduledSquealsDATE,
  scheduledSquealsTIME,
  replaceString,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
  checkForAllUsers,
  checkForAllChannels,
  checkIfReactionsAreValid,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
  containsOfficialChannels,
  checkIfRecipientsAreValid,
  checkIfArrayIsValid,
  addCommentsCountToSqueals,
} = require("./utils");

const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("./constants");
const { mentionNotification, squealInOfficialChannel } = require("./messages");

//TODO tradurre tutti i commenti in inglese
//TODO reagire se non sei autenticato

//DONE Controllati i casi in cui l'utente che fa richiesta è bannato
module.exports = {
  /**
   * Retrieve squeals with optional filters
   * @param options.keywords Filter squeals by keywords
   * @param options.content_type Filter squeals by content type (text, image, video, position)
   * @param options.created_after Filter squeals created after the specified date
   * @param options.created_before Filter squeals created before the specified date
   * @param options.is_scheduled Filter squeals by scheduled status
   * @param options.min_reactions Filter squeals with more than n total reactions
   * @param options.min_balance Filter squeals with more than n balance
   * @param options.max_balance Filter squeals with less than n balance
   * @param options.is_in_official_channel Filter squeals by official channel status
   * @param options.sort_order Sorts squeals, can be either "asc" or "desc"
   * @param options.sort_by Can be "impressions", "reactions", "date"
   * @param options.pag_size Number of squeals to retrieve
   * @param options.last_loaded Last loaded squeal id
   */
  //TODO controllare squeal in canale ufficiale, canale cancellato
  getSqueals: async (options) => {
    const {
      keywords,
      last_loaded,
      content_type,
      created_after,
      created_before,
      is_scheduled,
      min_reactions,
      min_balance,
      max_balance,
      is_in_official_channel,
      sort_order,
      sort_by,
    } = options;
    let { pag_size } = options;
    const sort_types = ["reactions", "impressions", "date"];
    const sort_orders = ["asc", "desc"];
    const pipeline = [];

    if (last_loaded) {
      if (!mongooseObjectIdRegex.test(last_loaded)) {
        return {
          status: 400,
          data: { error: `'last_loaded' must be a valid ObjectId.` },
        };
      }
      pipeline.push({ $match: { _id: { $gt: new mongoose.Types.ObjectId(last_loaded) } } });
    }

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
    if (keywords) {
      let keywordsArray = keywords;
      if (!Array.isArray(keywords)) {
        keywordsArray = [keywords];
      }
      pipeline.push({ $match: { "recipients.keywords": { $all: keywordsArray } } });
    }

    //check if the request has specified is_scheduled
    if (is_scheduled) {
      if (!["true", "false"].includes(is_scheduled))
        return {
          status: 400,
          data: { error: `Invalid 'is_scheduled' value. Must be either 'true' or 'false'.` },
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
        username: 1,
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
          data: { error: `'min_balance' must be a number.` },
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
          data: { error: `'balance' must be a number.` },
        };
      }
      if (intMinBalance && balance < intMinBalance) {
        //return an error if the max_balance is less than the min_balance
        return {
          status: 400,
          data: { error: `'max_balance' must be greater than 'min_balance'.` },
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
          data: { error: `'min_reactions' must be a positive number.` },
        };
      }
      pipeline.push({ $match: { reactions_count: { $gte: minReactions } } });
    }

    //check if the ------------------------

    if ((sort_order && !sort_by) || (!sort_order && sort_by)) {
      return {
        status: 400,
        data: { error: `Both 'sort_order' and 'sort_by' must be specified.` },
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
      else if (sort_by == "impressions") pipeline.push({ $sort: { impressions: order } });
      else if (sort_by == "date") pipeline.push({ $sort: { created_at: order } });
    }
    if (!pag_size) {
      pag_size = DEFAULT_PAGE_SIZE;
    } else {
      pag_size = parseInt(pag_size);
      if (isNaN(pag_size) || pag_size <= 0 || pag_size > MAX_PAGE_SIZE) {
        return {
          status: 400,
          data: { error: `'pag_size' must be a number between 1 and 100.` },
        };
      }
    }
    pipeline.push({ $limit: pag_size });

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

    //aggiungo il campo "comments_total" ad ogni squeal:

    const newData = await addCommentsCountToSqueals(data);
    //return the squeals
    return {
      status: 200,
      data: newData,
    };
  },

  /**
   * Get a squeal object by ID, or squeal HEX
   * @param options.identifier Squeal's identifier, can be either id
   */
  //TESTED
  getSqueal: async (options) => {
    const { identifier, is_in_official_channel, user_identifier, squeal_hex, user_id, is_token_valid } = options;
    let squeal;
    let user;
    if (is_token_valid) {
      //check if the user_id in the token is valid
      const response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      user = response.data;
    }
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
      const userId = response.data;

      if (hex == NaN || hex >= userId.squeals.posted.length) {
        return {
          status: 404,
          data: { error: `Squeal not found.` },
        };
      }
      const squeal_response = await findSqueal(userId.squeals.posted[hex], is_in_official_channel);
      if (squeal_response.status >= 300) {
        return {
          status: squeal_response.status,
          data: { error: squeal_response.error },
        };
      }
      squeal = squeal_response.data;
    }

    //impressions increment with save()
    if ((user && squeal.user_id != user._id) || !user) squeal.impressions++;
    await squeal.save();
    squeal = await addCommentsCountToSqueals([squeal]);

    //se l'utente ha reagito allo squeal, aggiungo il campo "reacted" allo squeal e lo setto a true
    //altrimenti false
    if (user) {
      if (user.squeals.reacted_to.includes(squeal[0]._id)) {
        squeal[0].reacted = true;
      } else {
        squeal[0].reacted = false;
      }
    }

    return {
      status: 200,
      data: squeal,
    };
  },
  /**
   * @param options.content_type Type of the squeal content, it can be "text", "image", "video" or "position"
   * @param options.content Squeal content, it can be a string, an image url, a video url or a position object
   * @param options.is_scheduled It tells you whether or not the squeal is scheduled
   * @param options.recipients Array of users, channels or keywords, with no limit and no impact on the quota.
   */
  //TESTED
  createSqueal: async (options) => {
    try {
      //vietare di postare in un canale ufficiales
      const { user_id, vip_id, content, recipients, is_scheduled } = options;
      //set the default value for content_type
      const content_type = options.content_type || "text";

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
        //equals funziona anche con ids
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
          data: { error: `Invalid 'content_type'.` },
        };
      }

      //check if the content is specified and correctly formatted
      //console.log(content);
      if (!content || content?.length == 0) {
        return {
          status: 400,
          data: { error: `'content' is required.` },
        };
      }

      //check if the recipients are specified
      if (!recipients) {
        return {
          status: 400,
          data: { error: `'recipients'is required.` },
        };
      }

      response = checkIfRecipientsAreValid(recipients);
      if (!response.isValid) {
        return {
          status: 400,
          data: { error: `Formatting error in 'recipients' parameter.` },
        };
      }

      const { users, channels, keywords } = response.value;

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

      const date = new Date();

      //create the hex_id from the length of the user squeals array
      hex_id = author.squeals?.posted?.length || 0;
      //create the squeal object
      const newSqueal = new Squeal({
        username: author.username,
        hex_id: hex_id,
        user_id: author._id,
        is_scheduled: is_scheduled || false,
        content_type: content_type,
        content: replaceString(content, hex_id, date, options.scheduled_squeal_data),
        recipients: {
          users: usersArray,
          channels: channelsArray,
          keywords: keywords,
        },
        created_at: date,
        last_modified: date,
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
        const notification = new Notification({
          user_ref: user,
          squeal_ref: result._id,
          content: mentionNotification(author.username, content),
          created_at: new Date(),
          source: "squeal",
          id_code: "mentionedInSqueal",
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

      //Create the comments section
      const newCommentSection = new CommentSection({
        squeal_ref: result._id,
        comments_array: [],
      });
      result.comment_section = (await newCommentSection.save())._id;

      await result.save();
      await newCommentSection.save();

      return {
        status: result ? 201 : 400,
        data: result ? result : { error: `Failed to create squeal` },
      };
    } catch (error) {
      console.log(error);
    }
  },

  /**
   * @param is_logged_in  Whether the user is logged in or not
   * @param last_loaded   Last loaded squeal id
   * @param pag_size      Number of squeals to retrieve
   */
  getHomeSqueals: async (options) => {
    const { user_id, is_logged_in, token_error } = options;
    let { last_loaded, pag_size } = options;
    const query = {};
    let user;
    //check the parameters
    if (!pag_size) {
      pag_size = DEFAULT_PAGE_SIZE;
    } else {
      pag_size = parseInt(pag_size);
      if (isNaN(pag_size) || pag_size <= 0 || pag_size > MAX_PAGE_SIZE) {
        return {
          status: 400,
          data: { error: `'pag_size' must be a number between 1 and 100.` },
        };
      }
    }

    if (last_loaded) {
      if (!mongooseObjectIdRegex.test(last_loaded)) {
        return {
          status: 400,
          data: { error: `'last_loaded' must be a valid ObjectId.` },
        };
      }
      query._id = { $lt: last_loaded };
    }
    //console.log("is_logged_in", is_logged_in);
    if (!is_logged_in) {
      //Utente non loggato, vede solo gli squeal nei canali ufficiali
      if (token_error == "noToken") query.is_in_official_channel = true;
      else if (token_error == "invalidTokenFormat")
        return {
          status: 400,
          data: { error: token_error },
        };
      else if (token_error == "TokenExpiredError")
        return {
          status: 401,
          data: { error: token_error },
        };
    } else {
      //Utente loggato, vede gli squeal dei canali a cui è iscritto, quelli dei canali ufficiali, e quelli in cui è taggato, ma non quelli dei canali silenziati
      const response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      user = response.data;
      const subscribed_channels = user.subscribed_channels;
      const muted_channels = user.preferences.muted_channels;
      query.$or = [
        { is_in_official_channel: true, content_type: { $ne: "deleted" } },
        {
          "recipients.channels": {
            $in: subscribed_channels,
            $nin: muted_channels,
          },
          content_type: { $ne: "deleted" },
        },
        { "recipients.users": { $in: [user._id] }, content_type: { $ne: "deleted" } },
      ];
    }
    let squeals_array = await Squeal.find(query).sort({ created_at: -1 }).limit(pag_size).exec();
    squeals_array = await addCommentsCountToSqueals(squeals_array);

    //aggiungo un campo "is_liked" ad ogni squeal e un campo che dice perchè è stato selezionato
    if (user) {
      for (const squeal of squeals_array) {
        if (user.squeals.reacted_to.includes(squeal._id)) {
          squeal.reacted = true;
        } else {
          squeal.reacted = false;
        }
        if (squeal.recipients.users.some((userId) => userId.equals(user._id) || userId.toString() === user._id.toString())) {
          squeal.selected = {
            because: "mentioned",
            ids: [user.name],
          };
        } else if (squeal.recipients.channels.some((channel) => user.subscribed_channels.includes(channel))) {
          let ids = squeal.recipients.channels.filter((channel) => user.subscribed_channels.includes(channel));
          let names = (
            await Channel.find({ _id: { $in: ids } })
              .select("name")
              .exec()
          ).map((channel) => channel.name);
          squeal.selected = {
            because: "subscribed",
            ids: names,
          };
        } else if (squeal.is_in_official_channel) {
          //ottengo i canali in recipients.channels (che sono solo id) e li filtro, prendendo solo quelli ufficiali, e infine prendo solo gli id
          const channels = (
            await Channel.find({ _id: { $in: squeal.recipients.channels }, is_official: true })
              .select("name")
              .exec()
          ).map((channel) => channel.name);
          squeal.selected = {
            because: "official",
            ids: channels,
          };
        }
      }
    }

    return {
      status: 200,
      data: squeals_array,
    };
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

    if (squeal.content_type == "deleted") {
      return {
        status: 400,
        data: { error: `Squeal already deleted` },
      };
    }

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
   * @param options.identifier  Squeal's identifier, can be either id
   * @param options.reaction    Reaction type one of the following: (like, love, laugh, dislike, disgust, disagree)
   */
  addReaction: async (options) => {
    const { identifier, reaction, user_id } = options;
    if (!reaction) {
      return {
        status: 400,
        data: { error: `'reaction' is required.` },
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
        status: 404,
        data: { error: `You can't react to a deleted squeal` },
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
        status: 409,
        data: { error: `You already reacted to this squeal.` },
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

  reportSqueal: async (options) => {
    const { identifier, user_id } = options;
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
        data: { error: `You're not allowed to report to a squeal while banned` },
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
        status: 404,
        data: { error: `You can't report a deleted squeal` },
      };
    }
    if (squeal.reported.checked) {
      return {
        status: 200,
        data: { message: `This squeal has already been checked.` },
      };
    }
    if (squeal.reported.by.includes(user._id)) {
      return {
        status: 200,
        data: { message: `You already reported this squeal.` },
      };
    }
    //console.log(squeal.reported, squeal.reported.by.length);
    if (squeal.reported.by.length == 0) {
      squeal.reported.first_report = Date.now();
    }
    squeal.reported.by.push(user._id);
    await squeal.save();

    return {
      status: 200,
      data: { message: "Squeal reported successfully" },
    };
  },

  //first_report  ->  sort by the date of the first report
  //report_number ->  sort by the number of reports
  //ratio         ->  sort by the ratio between reports and impressions
  //checked_date  ->  sort by the date of last check (only if checked is true)
  getReportedSqueals: async (options) => {
    let { user_id, last_loaded, pag_size, sort_by, sort_order, checked } = options;
    const sort_types = ["first_report", "report_number", "ratio", "checked_date"];
    const sort_orders = ["asc", "desc"];
    const pipeline = [];
    if (user_id) {
      const response = await findUser(user_id);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const user = response.data;
      if (user.account_type != "moderator") {
        return {
          status: 403,
          data: { error: `You are not allowed to see reported squeals.` },
        };
      }
    }

    if (last_loaded) {
      if (!mongooseObjectIdRegex.test(last_loaded)) {
        return {
          status: 400,
          data: { error: `'last_loaded' must be a valid ObjectId.` },
        };
      }
      pipeline.push({ $match: { _id: { $gt: new mongoose.Types.ObjectId(last_loaded) } } });
    }

    if (checked) {
      if (!["true", "false"].includes(checked))
        return {
          status: 400,
          data: { error: `Invalid 'checked' value. Must be either 'true' or 'false'.` },
        };
      pipeline.push({ $match: { "reported.checked": checked == "true" ? true : false } });
      if (checked == "false") pipeline.push({ $match: { "reported.by": { $exists: true, $not: { $size: 0 } } } });
    } else {
      pipeline.push({ $match: { "reported.by": { $exists: true, $not: { $size: 0 } } } });
    }

    //PROJECTION
    pipeline.push({
      $project: {
        _id: 1,
        username: 1,
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
        reported: 1,
      },
    });
    if ((sort_order && !sort_by) || (!sort_order && sort_by)) {
      return {
        status: 400,
        data: { error: `Both 'sort_order' and 'sort_by' must be specified.` },
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
      if (sort_by == "first_report") {
        pipeline.push({ $sort: { "reported.first_report": order } });
      } else if (sort_by == "report_number") {
        pipeline.push({ $sort: { "reported.by.length": order } });
      } else if (sort_by == "ratio") {
        pipeline.push({
          $addFields: {
            ratio: {
              $cond: {
                if: { $eq: ["$impressions", 0] },
                then: 0,
                else: { $divide: [{ $size: "$reported.by" }, "$impressions"] },
              },
            },
          },
        });
        pipeline.push({ $sort: { ratio: order } });
      } else if (sort_by == "checked_date") {
        if (checked == "true") pipeline.push({ $sort: { "reported.checked_at": order } });
        else return { status: 400, data: { error: `You can't sort by 'checked_date' if 'checked' is false or unspecified` } };
      }
    }
    if (!pag_size) {
      pag_size = DEFAULT_PAGE_SIZE;
    } else {
      pag_size = parseInt(pag_size);
      if (isNaN(pag_size) || pag_size <= 0 || pag_size > MAX_PAGE_SIZE) {
        return {
          status: 400,
          data: { error: `'pag_size' must be a number between 1 and 100.` },
        };
      }
    }
    pipeline.push({ $limit: pag_size });
    //console.log(pipeline);
    //execute the query
    const data = await Squeal.aggregate(pipeline).exec();

    //check if the query returned any result
    if (data.length <= 0) {
      return {
        status: 404,
        data: { error: `No squeal found.` },
      };
    }
    return {
      status: 200,
      data: data,
    };
  },

  markAsChecked: async (options) => {
    const { identifier, user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    //check if the user is active
    if (user.is_active == false && user.account_type != "moderator") {
      return {
        status: 403,
        data: { error: `You're not allowed to check a squeal if you're not a moderator or while banned` },
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
        status: 404,
        data: { error: `You can't check a deleted squeal` },
      };
    }

    if (squeal.reported.checked) {
      return {
        status: 200,
        data: { message: `This squeal has already been checked.` },
      };
    }

    squeal.reported.checked = true;
    squeal.reported.checked_by = user._id;
    squeal.reported.checked_at = Date.now();

    await squeal.save();

    return {
      status: 200,
      data: { message: "Squeal checked successfully" },
    };
  },

  /**
   * @param options.identifier Squeal's id
   * @param options.inlineReqJson.recipients Array of users, channels and keywords
   * @param options.inlineReqJson.reactions Array like {like: 0, love: 0, laugh: 0, dislike: 0, disgust: 0, disagree: 0}
   */
  updateSqueal: async (options) => {
    const { identifier, user_id } = options;
    const recipients = options.inlineReqJson.recipients;
    const reactions = options.inlineReqJson.reactions;
    if (!identifier) {
      return {
        status: 400,
        data: { error: `'identifier' is required.` },
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
        data: { error: `Both 'recipients' and 'reactions' must be specified.` },
      };
    }
    if (recipients) {
      response = checkIfRecipientsAreValid(recipients);
      if (!response.isValid) {
        return {
          status: 400,
          data: { error: `Formatting error in 'recipients' parameter.` },
        };
      }

      const { users, channels, keywords } = response.value;

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
      response = checkIfReactionsAreValid(reactions);

      if (!response.isValid) {
        return {
          status: 400,
          data: { error: `'reactions' object must be like {'love': '42', 'disgust' : '0' } with at least one field. Numbers must be non negative.` },
        };
      }
      const { like, love, laugh, dislike, disgust, disagree } = response.value;

      squeal.reactions.like = like || squeal.reactions.like;
      squeal.reactions.love = love || squeal.reactions.love;
      squeal.reactions.laugh = laugh || squeal.reactions.laugh;
      squeal.reactions.dislike = dislike || squeal.reactions.dislike;
      squeal.reactions.disgust = disgust || squeal.reactions.disgust;
      squeal.reactions.disagree = disagree || squeal.reactions.disagree;
    }

    squeal.last_modified = new Date();
    const updatedSqueal = await squeal.save();
    return {
      status: updatedSqueal ? 200 : 400,
      data: updatedSqueal ? updatedSqueal : { error: `Failed to update squeal` },
    };
  },
};
