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
   * @param options.created_after Filter channels created after the specified date
   * @param options.created_before Filter channels created before the specified date
   * @param options.is_official Filter channels by official status
   * @param options.min_subscribers Filter channels by minimum subscribers
   * @param options.max_subscribers Filter channels by maximum subscribers
   * @param options.min_squeals Filter channels by minimum squeals
   * @param options.max_squeals Filter channels by maximum squeals
   */
  getChannels: async (options) => {
    const { name, created_after, created_before, is_official, min_subscribers, max_subscribers, min_squeals, max_squeals, user_id } = options;
    const pipeline = [];

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const reqSender = response.data;
    if (reqSender.account_type !== "moderator") {
      pipeline.push({ $match: { is_blocked: false } });
    }

    if (name) {
      const regex = new RegExp(name, "i");
      pipeline.push({ $match: { name: { $regex: regex } } });
    }
    if (created_after) {
      const date = Date.parse(created_after);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: "created_after must be a valid date: YYYY-MM-DD" },
        };
      }
      pipeline.push({ $match: { created_at: { $gte: new Date(date) } } });
    }
    if (created_before) {
      const date = Date.parse(created_before);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: "created_before must be a valid date: YYYY-MM-DD" },
        };
      }
      pipeline.push({ $match: { created_at: { $lte: new Date(date) } } });
    }
    if (is_official) {
      console.log(is_official);
      if (!["true", "false"].includes(is_official)) {
        return {
          status: 400,
          data: { error: "is_official must be either true or false" },
        };
      }
      pipeline.push({ $match: { is_official: is_official == "true" ? true : false } });
    }

    pipeline.push({
      $project: {
        _id: 1, // Includi l'ID se necessario
        name: 1, // Includi il campo 'name'
        description: 1, // Includi il campo 'description'
        subscribers_count: { $size: "$subscribers" }, // Ottieni la dimensione dell'array 'subscribers'
        squeals_count: { $size: "$squeals" },
        is_blocked: 1,
        //immagine: 1, // Includi il campo 'immagine'

        // Aggiungi altri campi che desideri includere qui
      },
    });
    let subscribers_lower;
    if (min_subscribers !== undefined) {
      const int_min_subscribers = parseInt(min_subscribers);
      if (isNaN(int_min_subscribers)) {
        return {
          status: 400,
          data: { error: "min_subscribers must be an integer" },
        };
      }
      pipeline.push({ $match: { subscribers_count: { $gte: int_min_subscribers } } });
      subscribers_lower = int_min_subscribers;
    }
    if (max_subscribers !== undefined) {
      const int_max_subscribers = parseInt(max_subscribers);
      if (isNaN(int_max_subscribers)) {
        return {
          status: 400,
          data: { error: "max_subscribers must be an integer" },
        };
      }
      pipeline.push({ $match: { subscribers_count: { $lte: int_max_subscribers } } });
      if (subscribers_lower !== undefined && int_max_subscribers < subscribers_lower) {
        return {
          status: 400,
          data: { error: "max_subscribers must be greater or equal than min_subscribers" },
        };
      }
    }
    if (min_squeals !== undefined) {
      const int_min_squeals = parseInt(min_squeals);
      if (isNaN(int_min_squeals)) {
        return {
          status: 400,
          data: { error: "min_squeals must be an integer" },
        };
      }
      pipeline.push({ $match: { squeals_count: { $gte: int_min_squeals } } });
    }
    if (max_squeals !== undefined) {
      const int_max_squeals = parseInt(max_squeals);
      if (isNaN(int_max_squeals)) {
        return {
          status: 400,
          data: { error: "max_squeals must be an integer" },
        };
      }
      if (min_squeals !== undefined && int_max_squeals < parseInt(min_squeals)) {
        return {
          status: 400,
          data: { error: "max_squeals must be greater or equal than min_squeals" },
        };
      }
      pipeline.push({ $match: { squeals_count: { $lte: int_max_squeals } } });
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
  //TESTED
  createChannel: async (options) => {
    const { can_mute, user_id, description, is_official, name } = options.channelInput;

    //Check if owner exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const ownerUser = response.data;

    if (is_official && !["true", "false"].includes(is_official)) {
      return {
        status: 400,
        data: { error: "is_official must be either true or false" },
      };
    }
    const is_official_bool = is_official == "true" ? true : false;

    if (is_official_bool && ownerUser.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: "You don't have the permission to create an official channel" },
      };
    }

    if (can_mute && !["true", "false"].includes(can_mute)) {
      return {
        status: 400,
        data: { error: "can_mute must be either true or false" },
      };
    }
    const can_mute_bool = can_mute == "false" ? false : true;

    if (!is_official_bool && !can_mute_bool) {
      return {
        status: 403,
        data: { error: "You can't create an unofficial channel that can't be muted" },
      };
    }

    if (!name) {
      return {
        status: 400,
        data: { error: "name is required" },
      };
    }

    if (!is_official_bool && !channelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error: `Unofficial channels must be lowercase, space-free and between ${CHANNEL_NAME_MIN_LENGTH} and ${CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
        },
      };
    }

    if (is_official_bool && !officialChannelNameRegex.test(name)) {
      return {
        status: 400,
        data: {
          error: `Official channels must be uppercase, space-free and between ${OFFICIAL_CHANNEL_NAME_MIN_LENGTH} and ${OFFICIAL_CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
        },
      };
    }

    if (!description) {
      return {
        status: 400,
        data: { error: "Description is required" },
      };
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        status: 400,
        data: { error: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters, yours is ${description.length}.` },
      };
    }

    const newChannel = new Channel({
      owner: ownerUser._id,
      name: name,
      description: description,
      is_official: is_official_bool, //default False
      can_mute: can_mute_bool, //default True
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
  //TESTED
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
    if ((isTokenValid && channel.is_blocked && user?.account_type !== "moderator") || (!isTokenValid && !channel.is_official)) {
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
   * @param options.identifier Channel's identifier, can be either id or name
   */
  //TESTED
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
  //TODO DA TESTARE
  updateChannel: async (options) => {
    try {
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

      let response = await findChannel(identifier);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const channel = response.data;

      //se non ha i permessi, ritorna un errore
      if (!user._id.equals(channel.owner) && !channel.editors.includes(user_id) && user.account_type !== "moderator") {
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

      //se la richiesta include un nuovo nome per il canale, controlla i permessi, controlla che sia valido, controlla che non esista già e aggiorna il nome
      if (newName) {
        if (channel.is_official && !officialChannelNameRegex.test(newName)) {
          //check if the name is lowercase, alphanumeric and between 5 and 23 characters
          return {
            status: 400,
            data: {
              error: `Official channels must be uppercase, space-free and between ${OFFICIAL_CHANNEL_NAME_MIN_LENGTH} and ${OFFICIAL_CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
            },
          };
        }
        if (!channel.is_official && !channelNameRegex.test(newName)) {
          return {
            status: 400,
            data: {
              error: `Unofficial channels must be lowercase, space-free and between ${CHANNEL_NAME_MIN_LENGTH} and ${CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
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
        }
        //se non esiste già
        channel.name = newName;
      }

      //Modificare editors o owner
      if (user._id.equals(channel.owner) || user.account_type == "moderator") {
        //Cambio gli editors
        const parsedEditorsArray = JSON.parse(editorsArray);
        if (Array.isArray(parsedEditorsArray)) {
          let data = await checkForAllUsers(parsedEditorsArray);
          if (!data.usersOutcome) {
            //se non esistono, ritorna un errore
            return {
              status: 404,
              data: { error: "Users not valid" },
            };
          }
          const editorsIds = data.usersArray;
          //se tra gli editors c'è il proprietario, ritorna un errore
          //console.log(editorsArray);
          if (editorsIds.some((editorId) => editorId.equals(channel.owner))) {
            return {
              status: 400,
              data: { error: "The owner can't be an editor" },
            };
          }
          //controlla che gli editors esistano
          const { added, removed } = addedAndRemoved(channel.editors, editorsIds);

          const addedUserPromises = added.map(async (user) => {
            let userObject = (await findUser(user._id)).data;
            userObject.editor_channels.push(channel._id);
            await userObject.save();
          });

          const removedUserPromises = removed.map(async (user) => {
            let userObject = (await findUser(user._id)).data;
            userObject.editor_channels.pull(channel._id);
            await userObject.save();
          });

          // Attendere che tutte le promesse vengano risolte
          await Promise.all([...addedUserPromises, ...removedUserPromises]);

          //aggiorno gli editors
          channel.editors = editorsIds;
        }

        //Cambio l'owner
        if (typeof newOwner !== "undefined") {
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
    } catch (err) {
      console.error(err);
      throw new Error("Failed to update channel");
    }
  },

  /**
   * @param options.identifier Channel's identifier, can be either id or name
   */
  leaveModTeam: async (options) => {
    const { identifier, user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    if (!channel.editors.includes(user._id)) {
      return {
        status: 403,
        data: { error: "You're not an editor of this channel" },
      };
    }

    channel.editors.pull(user._id);
    user.editor_channels.pull(channel._id);

    await channel.save();
    await user.save();

    return {
      status: 200,
      data: { message: "You left the mod team" },
    };
  },

  /**
   * @param option.identifier Channel's identifier, can be either id or name
   * @param option.squealIdentifier Squeal's identifier, can be either id or name
   */
  removeSquealFromChannel: async (options) => {
    const { identifier, squealIdentifier, user_id } = options;
    let response = findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    //controllo se esiste il canale
    response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    //controlliamo se l'utente è un moderatore o il proprietario del canale o editor
    if (!(user.account_type == "moderator" || channel.owner.equals(user._id) || channel.editors.includes(user._id))) {
      return {
        status: 403,
        data: { error: "You don't have the permission to remove squeals from this channel" },
      };
    }

    //controllo se esiste lo squeal
    response = await findSqueal(squealIdentifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

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
    if (user.account_type !== "moderator") {
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
   * @param options.value Query value which can be either "true" or "false"
   */
  //TODO DA TESTARE
  channelMuteStatus: async (options) => {
    const { identifier, user_id, value } = options;
    //Check if value is correct
    if (value && !["true", "false"].contains(value)) {
      return {
        status: 400,
        data: { error: `"value" must be either "true" or "false"` },
      };
    }
    const value_bool = value == "true" ? true : false;

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

    //check if the channel cannot be muted
    if (!channel.can_mute) {
      return {
        status: 403,
        data: { error: "You can't mute/unmute this channel" },
      };
    }

    //if they want to mute it, check if they're subscribed to it
    if (value_bool) {
      if (!user.subscribed_channels.includes(channel._id)) {
        return {
          status: 403,
          data: { error: "You can't mute a channel you're not subscribed to" },
        };
      }
      user.preferences.muted_channels.push(channel._id);
    }

    //if they want to unmute it
    if (!value_bool) {
      //check if they muted it, if they didn't, return an error
      if (!user.preferences.muted_channels.includes(channel._id)) {
        return {
          status: 403,
          data: { error: "You can't unmute a channel you didn't mute" },
        };
      }
      //otherwise, remove it from the muted channels array
      user.preferences.muted_channels.pull(channel._id);
    }

    await user.save();
    return {
      status: 200,
      data: { message: "Channel muted" },
    };
  },

  /**
   * Toggle channel subscription  by ID or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   * @param options.value Query value which can be either "true" or "false"
   */
  //TODO DA TESTARE
  channelSubscription: async (options) => {
    const { identifier, value, user_id } = options;
    //Check if value is correct
    if (value && !["true", "false"].contains(value)) {
      return {
        status: 400,
        data: { error: `"value" must be either "true" or "false"` },
      };
    }
    const value_bool = value == "true" ? true : false;

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

    //if value is false and the user is subscribed to that channel, unsubscribe them
    if (!value_bool && user.subscribed_channels.includes(channel._id)) {
      user.subscribed_channels.pull(channel._id);
    }
    //if value is true and the user is not subscribed to that channel, subscribe them
    else if (value_bool && !user.subscribed_channels.includes(channel._id)) {
      user.subscribed_channels.push(channel._id);
      //if the user had muted the channel, remove it from the muted channels array
      user.preferences.muted_channels.pull(channel._id);
    }

    await user.save();

    return {
      status: 200,
      data: { message: "User subscribed to the channel" },
    };
  },
};
