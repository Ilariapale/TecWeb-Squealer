const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const {
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
} = require("./utils");
module.exports = {
  //TODO filtro per prendere gli ultimi "N" squeal
  //TODO funzione per silenziare e riattivare un canale (fatto)
  //TODO funzione per iscrivermi e disiscrivermi un canale (fatto)
  /**
   * Retrieve channels with optional filters
   * @param options.name Filter channels by name
   * @param options.createdAfter Filter channels created after the specified date
   * @param options.createdBefore Filter channels created before the specified date
   * @param options.is_official Filter channels by official status
   */
  getChannels: async (options) => {
    const { name, createdAfter, createdBefore, is_Official } = options;
    const pipeline = [];
    if (name) {
      const regex = new RegExp(name, "i");
      pipeline.push({ $match: { name: { $regex: regex } } });
    }
    if (createdAfter) {
      pipeline.push({ $match: { created_at: { $gte: new Date(createdAfter) } } });
    }
    if (createdBefore) {
      pipeline.push({ $match: { created_at: { $lte: new Date(createdBefore) } } });
    }
    if (is_Official) {
      pipeline.push({ $match: { is_official: is_Official } });
    }
    pipeline.push({ $match: { is_blocked: false } });

    //console.log(pipeline);
    const data = await Channel.aggregate(pipeline).exec();

    return {
      status: 200,
      data: data,
    };
  },

  /**
   * Create a new user
   * @param options.channelInput.user User that creates the channel
   * @param options.channelInput.can_mute It tells you whether the channel can be muted or not
   * @param options.channelInput.description Channel's description
   * @param options.channelInput.is_official It tells you whether the channel is official or not
   * @param options.channelInput.name Channel's name
   */
  createChannel: async (options) => {
    const { can_mute, user, description, is_official, name } = options.channelInput;

    //TODO controllare i permessi per creare un canale dopo che abbiamo implementato l'autenticazione
    //Check if creator exists
    let response = await findUser(user);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const creatorUser = response.data;

    if (!name) {
      return {
        status: 400,
        data: { error: "name is required" },
      };
    }
    if (!channelNameRegex.test(name) && !officialChannelNameRegex.test(name)) {
      //check if the name is lowercase, alphanumeric and between 5 and 23 characters
      return {
        status: 400,
        data: { error: "name format not valid" },
      };
    }

    if (is_official && !creatorUser.account_type == "moderator") {
      return {
        status: 403,
        data: { error: "You don't have the permission to create an official channel" },
      };
    }

    if (!is_official && !channelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error: "Unofficial channels must be lowercase, space-free and between 5 and 23 characters.\n" + "It can only contain alphanumeric characters and underscore.",
        },
      };
    }

    if (is_official && !officialChannelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error: "Official channels must be uppercase, space-free and between 5 and 23 characters.\n" + "It can only contain alphanumeric characters and underscore.",
        },
      };
    }

    if (!description) {
      return {
        status: 400,
        data: { error: "description is required" },
      };
    }

    //check if the name already exists in the database
    const newChannel = new Channel({
      creators: [creatorUser._id],
      name: name,
      description: description,
      is_official: is_official || false,
      can_mute: can_mute || true,
      created_at: Date.now(),
    });
    try {
      const data = await newChannel.save();
      User.findByIdAndUpdate(creatorUser._id, { $push: { created_channels: data._id } }).exec();
      return {
        status: 201,
        data: data,
      };
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        // validation error
        const errorMessage = Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");
        return {
          status: 400,
          data: { error: errorMessage },
        };
      } else if (err.code == 11000) {
        return {
          status: 409,
          data: { error: "Channel name already exists" },
        };
      } else {
        console.error(err);
        throw new Error("Failed to create channel");
      }
    }
  },

  /**
   * Get a channel object by ID or by id, or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   */
  getChannel: async (options) => {
    //options.isTokenValid - if the token is not valid, the user can only see official channels
    //options.user_id - user_id of request sender
    const { identifier, isTokenValid, user_id } = options;

    if (!identifier) {
      return {
        status: 400,
        data: { error: "Channel identifier is required." },
      };
    }

    let response = await findChannel(identifier, true, true);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    let user;
    if (isTokenValid) {
      response = await findUser(user_id);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      user = response.data;
    }
    //Se il canale è bloccato e l'utente non è un moderatore Oppure, se il token non è valido e il canale non è ufficiale.
    if ((isTokenValid && channel.is_blocked && !(user?.account_type == "moderator")) || (!isTokenValid && !channel.is_official)) {
      return {
        status: 404,
        data: { error: "Channel not found" },
      };
    }
    return {
      status: response.status,
      data: channel,
    };
  },

  /**
   *
   * @param options.identifier Channel's identifier, can be either id or name
   */
  deleteChannel: async (options) => {
    //TODO aggiornare funzione con i permessi di moderatore
    //TODO togliere user da tutti i descrittori di funzioni
    const { identifier, user } = options;

    let response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let channel = response.data;

    //remove the channel from the squeals recipients
    const updateRecipientsPromises = [];
    for (const squeal of channel.squeals) {
      //remove the channel from the squeals
      let promise = Squeal.findByIdAndUpdate(squeal, { $pull: { "recipients.channels": channel._id } }).exec();
      updateRecipientsPromises.push(promise);
    }
    const updatedSqueals = await Promise.all(updateRecipientsPromises);

    //remove the channel from the users subscribed channels, the channel from the users muted channels,the channel from the users created channels
    const updateSubscribedChannelsPromises = [];
    for (const user of channel.subscribers) {
      let promise = User.findByIdAndUpdate(user, {
        $pull: { subscribed_channels: channel._id },
        $pull: { created_channels: channel._id },
        $pull: { "preferences.muted_channels": channel._id },
      }).exec();
      updateSubscribedChannelsPromises.push(promise);
    }
    const updatedUser = await Promise.all(updateSubscribedChannelsPromises);

    //remove the channel from the database
    await Channel.findByIdAndRemove(channel._id).exec();

    return {
      status: 200,
      data: { message: "Channel deleted" },
    };
  },

  /**
   * @param options.identifier Channel's identifier, can be either the name or the id
   * @param options.updateChannelInlineReqJson.creatorsArray
   * @param options.updateChannelInlineReqJson.is_blocked
   * @param options.updateChannelInlineReqJson.newName
   * @param options.updateChannelInlineReqJson.newDescription
   */
  updateChannel: async (options) => {
    // TODO sia un proprietario sia uno squealer moderator sia un mod del canale possono effettuare modifiche
    // in particolare un mod si occupa di rimuovere degli squeal dal canale
    const { identifier } = options;
    const { creatorsArray, is_blocked, newName, newDescription } = options.updateChannelInlineReqJson;

    let response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let channel = response.data;

    if (!creatorsArray && !is_blocked && !newName && !newDescription) {
      return {
        status: 400,
        data: { error: "No update parameters specified" },
      };
    }

    channel.name = newName || channel.name;
    channel.creators = creatorsArray || channel.creators;
    channel.description = newDescription || channel.description;
    //TODO controllare se funziona
    typeof is_blocked !== "undefinded" ? (channel.is_blocked = is_blocked) : null;

    channel.save();
  },
  /**
   * Toggle is_blocked field in user object, means that the channel is blocked or not
   * @param options.identifier Channel's identifier, can be either username or userId
   */
  toggleChannelBlockedStatus: async (options) => {
    const { identifier, user_id } = options; //options.user_id is the Request sender's user id

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const user = response.data;

    // Check if the user is a moderator
    if (!user.account_type == "moderator") {
      return {
        status: 403,
        data: { error: "You don't have the permission to block/unblock a channel" },
      };
    }

    response = await findChannel(identifier, true);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    // Toggle the is_blocked field
    channel.is_blocked = !channel.is_blocked;
    // Return the result
    channel.save();
    return {
      status: 200,
      data: updatedChannel,
    };
  },

  /**
   * Toggle channel mute status by ID or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   * @param options.user_id User's identifier
   */

  toggleChannelMuteStatus: async (options) => {
    const { identifier, user_id } = options;

    //check if the user exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    //check if channel exists
    response = await findChannel(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    //check if the channel is already muted by the user
    if (user.preferences.muted_channels.includes(channel._id)) {
      await User.findByIdAndUpdate(user._id, { $pull: { "preferences.muted_channels": channel._id } }, { new: true });
      return {
        status: 200,
        data: { error: "Channel unmuted" },
      };
    }

    //check if the user is subscribed to the channel
    if (!user.subscribed_channels.includes(channel._id)) {
      return {
        status: 403,
        data: { error: "You can't mute a channel you're not subscribed to" },
      };
    }

    //check if the channel can be muted
    if (!channel.can_mute) {
      return {
        status: 403,
        data: { error: "You can't mute this channel" },
      };
    }

    //if not, add the channel to the user's muted channels
    user.preferences.muted_channels.push(channel._id);
    await user.save();
    return {
      status: 200,
      data: { message: "Channel muted" },
    };
  },

  /**
   * Toggle channel subscription  by ID or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   * @param options.user_id User's identifier
   */

  toggleChannelSubscription: async (options) => {
    const { identifier, user_id } = options;
    //check if the user exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;
    //check if channel exists
    response = await findChannel(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    //check if the user is already subscribed to the channel
    if (user.subscribed_channels.includes(channel._id)) {
      await User.findByIdAndUpdate(user._id, { $pull: { subscribed_channels: channel._id } }, { new: true });
      return {
        status: 200,
        data: { error: "User unsubscribed to the channel" },
      };
    }
    //if not, add the channel to the user's subscribed channels
    user.subscribed_channels.push(channel._id);
    await user.save();
    return {
      status: 200,
      data: { message: "User subscribed to the channel" },
    };
  },
};
