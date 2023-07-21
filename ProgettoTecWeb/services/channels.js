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
  /**
   * Retrieve channels with optional filters
   * @param options.name Filter channels by name
   * @param options.createdAfter Filter channels created after the specified date
   * @param options.createdBefore Filter channels created before the specified date
   * @param options.isOfficial Filter channels by official status
   */
  getChannels: async (options) => {
    const { name, createdAfter, createdBefore, isOfficial } = options;
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
    if (isOfficial) {
      pipeline.push({ $match: { is_official: isOfficial } });
    }
    pipeline.push({ $match: { isBlocked: false } });

    //console.log(pipeline);
    const data = await Channel.aggregate(pipeline).exec();

    return {
      status: 200,
      data: data,
    };
  },

  /**
   * Create a new user
   * @param options.channelInput.can_mute It tells you whether the channel can be muted or not
   * @param options.channelInput.creator Creator's id, if it is official then the field is empty
   * @param options.channelInput.description Channel's description
   * @param options.channelInput.is_official It tells you whether the channel is official or not
   * @param options.channelInput.name Channel's name
   */
  createChannel: async (options) => {
    const { can_mute, creator, description, is_official, name } = options.channelInput;

    //TODO controllare i permessi per creare un canale dopo che abbiamo implementato l'autenticazione
    if (!creator) {
      return {
        status: 400,
        data: { error: "creator is required" },
      };
    }

    //Check if creator exists
    let response = await findUser(creator);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let creatorExists = response.data;

    if (!name) {
      return {
        status: 400,
        data: { error: "name is required" },
      };
    }

    if (!is_official && !(name === name.toLowerCase())) {
      return {
        status: 400,
        data: { error: "name must be lowercase" },
      };
    }

    if (!channelNameRegex.test(name) && !officialChannelNameRegex.test(name)) {
      //check if the name is lowercase, alphanumeric and between 5 and 23 characters
      return {
        status: 400,
        data: { error: "name format not valid" },
      };
    }

    if (officialChannelNameRegex.test(name)) {
      //devi avere i permessi
      //TODO permessi
    }

    if (!description) {
      return {
        status: 400,
        data: { error: "description is required" },
      };
    }

    //check if the name already exists in the database

    const newChannel = new Channel({
      creators: [creatorExists._id],
      name: name,
      description: description,
      is_official: is_official || false,
      can_mute: can_mute || true,
      created_at: Date.now(),
    });
    try {
      const data = await newChannel.save();
      User.findByIdAndUpdate(creatorExists._id, { $push: { created_channels: data._id } }).exec();
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
    const { identifier } = options;
    let data;
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Channel identifier is required." },
      };
    }

    let response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }

    return {
      status: response.status,
      data: response.data,
    };
  },

  /**
   *
   * @param options.identifier Channel's identifier, can be either id or name
   */
  deleteChannel: async (options) => {
    const { identifier } = options;

    // if (mongooseObjectIdRegex.test(identifier)) {
    //   channel = await Channel.findById(identifier);
    // } else if (channelNameRegex.test(identifier)) {
    //   channel = await Channel.findOne({ name: identifier });
    // } else {
    //   return {
    //     status: 400,
    //     data: { error: "Invalid identifier" },
    //   };
    // }
    // if (!channel) {
    //   return {
    //     status: 404,
    //     data: { error: "Channel not found" },
    //   };
    // }

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
   * @param options.updateChannelInlineReqJson.isBlocked
   * @param options.updateChannelInlineReqJson.newName
   * @param options.updateChannelInlineReqJson.newDescription
   */
  updateChannel: async (options) => {
    const { identifier } = options;
    const { creatorsArray, isBlocked, newName, newDescription } = options.updateChannelInlineReqJson;

    let response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    let channel = response.data;

    if (!creatorsArray && !isBlocked && !newName && !newDescription) {
      return {
        status: 400,
        data: { error: "No update parameters specified" },
      };
    }

    channel.name = newName || channel.name;
    channel.creators = creatorsArray || channel.creators;
    channel.description = newDescription || channel.description;
    //TODO controllare se funziona
    typeof isBlocked !== "undefinded" ? (channel.isBlocked = isBlocked) : null;

    channel.save();
  },
};
