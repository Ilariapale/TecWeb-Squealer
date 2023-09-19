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
  checkForAllUsers,
  addedAndRemoved,
} = require("./utils");
const { MAX_DESCRIPTION_LENGTH, CHANNEL_NAME_MIN_LENGTH, CHANNEL_NAME_MAX_LENGTH, OFFICIAL_CHANNEL_NAME_MIN_LENGTH, OFFICIAL_CHANNEL_NAME_MAX_LENGTH } = require("./constants");
module.exports = {
  /**
   * Retrieve channels with optional filters
   * @param options.name Filter channels by name
   * @param options.createdAfter Filter channels created after the specified date
   * @param options.createdBefore Filter channels created before the specified date
   * @param options.is_official Filter channels by official status
   * @param options.minSubscribers Filter channels by minimum subscribers
   * @param options.maxSubscribers Filter channels by maximum subscribers
   * @param options.minSqueals Filter channels by minimum squeals
   * @param options.maxSqueals Filter channels by maximum squeals
   */
  getChannels: async (options) => {
    const { name, createdAfter, createdBefore, is_Official, minSubscribers, maxSubscribers, minSqueals, maxSqueals } = options;
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

    pipeline.push({
      $project: {
        _id: 1, // Includi l'ID se necessario
        name: 1, // Includi il campo 'name'
        description: 1, // Includi il campo 'description'
        subscribersCount: { $size: "$subscribers" }, // Ottieni la dimensione dell'array 'subscribers'
        squealsCount: { $size: "$squeals" },
        //immagine: 1, // Includi il campo 'immagine'

        // Aggiungi altri campi che desideri includere qui
      },
    });

    if (minSubscribers !== undefined) {
      pipeline.push({ $match: { subscribersCount: { $gte: minSubscribers } } });
    }
    if (maxSubscribers !== undefined) {
      pipeline.push({ $match: { subscribersCount: { $lte: maxSubscribers } } });
    }
    if (minSqueals !== undefined) {
      pipeline.push({ $match: { squealsCount: { $gte: minSqueals } } });
    }
    if (maxSqueals !== undefined) {
      pipeline.push({ $match: { squealsCount: { $lte: maxSqueals } } });
    }

    //console.log(pipeline);
    const data = await Channel.aggregate(pipeline).exec();

    return {
      status: 200,
      data: data,
    };
  },

  /**
   * Create a new channel
   * @param options.channelInput.can_mute It tells you whether the channel can be muted or not
   * @param options.channelInput.description Channel's description
   * @param options.channelInput.is_official It tells you whether the channel is official or not
   * @param options.channelInput.name Channel's name
   */
  createChannel: async (options) => {
    const { can_mute, user, description, is_official, name } = options.channelInput;

    //Check if owner exists
    let response = await findUser(user);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const ownerUser = response.data;

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

    if (is_official && !ownerUser.account_type == "moderator") {
      return {
        status: 403,
        data: { error: "You don't have the permission to create an official channel" },
      };
    }

    if (!is_official && can_mute != undefined && can_mute == false) {
      return {
        status: 403,
        data: { error: "You can't create an unofficial channel that can't be muted" },
      };
    }

    if (!is_official && !channelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error:
            `Unofficial channels must be lowercase, space-free and between ${CHANNEL_NAME_MIN_LENGTH} and ${CHANNEL_NAME_MAX_LENGTH} characters.\n` +
            `It can only contain alphanumeric characters and underscore.`,
        },
      };
    }

    if (is_official && !officialChannelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error:
            `Official channels must be uppercase, space-free and between ${OFFICIAL_CHANNEL_NAME_MIN_LENGTH} and ${OFFICIAL_CHANNEL_NAME_MAX_LENGTH} characters.\n` +
            `It can only contain alphanumeric characters and underscore.`,
        },
      };
    }

    if (!description) {
      return {
        status: 400,
        data: { error: "description is required" },
      };
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        status: 400,
        data: { error: `description must be less than ${MAX_DESCRIPTION_LENGTH} characters` },
      };
    }

    const newChannel = new Channel({
      owner: ownerUser._id,
      name: name,
      description: description,
      is_official: is_official || false,
      can_mute: can_mute || true,
      created_at: Date.now(),
    });
    try {
      const savedChannel = await newChannel.save();
      User.findByIdAndUpdate(ownerUser._id, { $push: { owned_channels: savedChannel._id } }).exec();
      return {
        status: 201,
        data: savedChannel,
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
    const { identifier, user_id } = options;

    let response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    if (!(user.account_type == "moderator" || channel.owner.equals(user._id))) {
      return {
        status: 403,
        data: { error: "You don't have the permission to delete this channel" },
      };
    }

    //remove the channel from the database with my custom delete function
    await channel.Delete();

    return {
      status: 200,
      data: { message: "Channel deleted" },
    };
  },

  /**
   * @param options.identifier Channel's identifier, can be either the name or the id
   * @param options.updateChannelInlineReqJson.editorsArray
   * @param options.updateChannelInlineReqJson.newName
   * @param options.updateChannelInlineReqJson.newDescription
   * @param options.updateChannelInlineReqJson.newOwner
   */
  updateChannel: async (options) => {
    const { identifier, user_id } = options;
    const { editorsArray, newName, newDescription } = options.updateChannelInlineReqJson;
    let data = await findUser(user_id);
    if (data.status >= 300) {
      //if the response is an error
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    const user = data.data;

    //se non ha i permessi, ritorna un errore
    if (!user_id == channel.owner || !channel.editors.includes(user_id) || !user.account_type == "moderator") {
      return {
        status: 403,
        data: { error: "You don't have the permission to update this channel" },
      };
    }

    if (!editorsArray && !newName && !newDescription) {
      return {
        status: 400,
        data: { error: "No update parameters specified" },
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
    const channel = response.data;

    //se la richiesta include un nuovo nome, controlla i permessi, controlla che sia valido, controlla che non esista già e aggiorna il nome
    if (newName) {
      if (channel.is_official && !officialChannelNameRegex.test(newName)) {
        //check if the name is lowercase, alphanumeric and between 5 and 23 characters
        return {
          status: 400,
          data: {
            error:
              `Official channels must be uppercase, space-free and between ${OFFICIAL_CHANNEL_NAME_MIN_LENGTH} and ${OFFICIAL_CHANNEL_NAME_MAX_LENGTH} characters.\n` +
              `It can only contain alphanumeric characters and underscore.`,
          },
        };
      }
      if (!channel.is_official && !channelNameRegex.test(newName)) {
        return {
          status: 400,
          data: {
            error:
              `Unofficial channels must be lowercase, space-free and between ${CHANNEL_NAME_MIN_LENGTH} and ${CHANNEL_NAME_MAX_LENGTH} characters.\n` +
              `It can only contain alphanumeric characters and underscore.`,
          },
        };
      }
      //controlla che il nome non esista già
      response = await findChannel(newName);
      if (response.status < 300) {
        //se esiste già
        return {
          status: 409,
          data: {
            error: response.error,
          },
        };
      } else {
        //se non esiste già
        channel.name = newName;
      }
    }

    //Modificare editors o owner
    if (user_id == channel.owner || user.account_type == "moderator") {
      //Cambio gli editors
      if (Array.isArray(editorsArray) && editorsArray.length > 0) {
        //editors

        //se è un proprietario o un moderatore, aggiorna la lista degli editors
        //controlla che gli editors esistano
        const { added, removed } = addedAndRemoved(channel.editors, editorsArray);

        let addedUsers = await checkForAllUsers(added);
        let removedUsers = await checkForAllUsers(removed);

        if (addedUsers.usersOutcome) {
          //se esistono, aggiorna la lista degli editori
          channel.editors = editorsArray;
        }

        const addedUserPromises = addedUsers.usersArray.map(async (user) => {
          user.editor_channels.push(channel._id);
          await user.save();
        });

        const removedUserPromises = removedUsers.usersArray.map(async (user) => {
          user.editor_channels.pull(channel._id);
          await user.save();
        });

        // Attendere che tutte le promesse vengano risolte
        await Promise.all([...addedUserPromises, ...removedUserPromises]);
      }

      //Cambio l'owner
      if (newOwner) {
        //verifico che il nuovo proprietario esista
        let response = await findUser(newOwner);
        if (response.status >= 300) {
          //se non esiste
          return {
            status: response.status,
            data: { error: response.error },
          };
        }
        const newOwnerUser = response.data;

        response = await findUser(channel.owner);
        if (response.status >= 300) {
          //se non esiste
          return {
            status: response.status,
            data: { error: response.error },
          };
        }
        const oldOwnerUser = response.data;

        channel.owner = newOwnerUser._id;

        newOwnerUser.owned_channels.push(channel._id);
        oldOwnerUser.owned_channels.pull(channel._id);

        await newOwnerUser.save();
        await oldOwnerUser.save();
        await channel.save();
      }
    } else {
      return {
        status: 403,
        data: { error: "You don't have the permission to change editors in this channel" },
      };
    }

    channel.description = newDescription || channel.description;

    await channel.save();
    return {
      status: 200,
      data: channel,
    };
  },

  /**
   * @param option.identifier Channel's identifier, can be either id or name
   * @param option.squealIdentifier Squeal's identifier, can be either id or name
   */
  removeSquealFromChannel: async (options) => {
    const { identifier, squealIdentifier, user_id } = options;
    let data = findUser(user_id);
    if (data.status >= 300) {
      //if the response is an error
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    const user = data.data;

    //controllo se esiste il canale
    data = await findChannel(identifier);
    if (data.status >= 300) {
      //if the response is an error
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    const channel = data.data;

    //controlliamo se l'utente è un moderatore o il proprietario del canale o editor
    if (!(user.account_type == "moderator" || channel.owner.equals(user._id) || channel.editors.includes(user._id))) {
      return {
        status: 403,
        data: { error: "You don't have the permission to remove squeals from this channel" },
      };
    }

    //controllo se esiste lo squeal
    data = await findSqueal(squealIdentifier);
    if (data.status >= 300) {
      //if the response is an error
      return {
        status: data.status,
        data: { error: data.error },
      };
    }
    const squeal = data.data;

    //controllo se lo squeal è presente nel canale
    if (!channel.squeals.includes(squeal._id)) {
      return {
        status: 404,
        data: { error: "Squeal not found in this channel" },
      };
    }

    //rimuovo lo squeal dal canale e il canale dallo squeal
    channel.squeals.pull(squeal._id);
    squeal.recipients.channels.pull(channel._id);
    await channel.save();
    await squeal.save();
    return {
      status: 200,
      data: { message: "Squeal removed from channel" },
    };
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

    //if the user had muted the channel, remove it from the muted channels array
    if (user.preferences.muted_channels.includes(channel._id)) {
      await User.findByIdAndUpdate(user._id, { $pull: { "preferences.muted_channels": channel._id } }, { new: true });
    }

    return {
      status: 200,
      data: { message: "User subscribed to the channel" },
    };
  },
};
