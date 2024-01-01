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
  checkIfArrayIsValid,
} = require("./utils");
const {
  MAX_DESCRIPTION_LENGTH,
  CHANNEL_NAME_MIN_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  OFFICIAL_CHANNEL_NAME_MIN_LENGTH,
  OFFICIAL_CHANNEL_NAME_MAX_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  FULL_DAY_MINUS_ONE_MILLISECOND,
} = require("./constants");
const {
  newOwnerNotification,
  removedOwnerNotification,
  newEditorForChannelNotification,
  removedEditorForChannelNotification,
  bannedChannelNotification,
  unbannedChannelNotification,
} = require("./messages");
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
   * @param options.sort_order Sorts channels, can be either "asc" or "desc"
   * @param options.sort_by Sorts channels by the specified field, it can be "name", "date", "squeals", "subscribers"
   * @param options.pag_size Number of channels to retrieve
   * @param options.last_loaded Last loaded channel's id
   */
  getChannels: async (options) => {
    const {
      is_token_valid,
      last_loaded,
      name,
      created_after,
      created_before,
      is_official,
      min_subscribers,
      max_subscribers,
      min_squeals,
      max_squeals,
      sort_order,
      sort_by,
      user_id,
    } = options;
    let { pag_size } = options;
    const sort_orders = ["asc", "desc"];
    const sort_types = ["name", "date", "squeals", "subscribers"];
    const pipeline = [];

    let reqSender;
    if (is_token_valid) {
      let response = await findUser(user_id);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      reqSender = response.data;
      if (reqSender.account_type !== "moderator") {
        pipeline.push({ $match: { is_blocked: false } });
      }
    } else {
      pipeline.push({ $match: { is_blocked: false } });
    }

    if ((sort_order && !sort_by) || (!sort_order && sort_by)) {
      return {
        status: 400,
        data: { error: `Both 'sort_order' and 'sort_by' must be specified.` },
      };
    } else if (sort_order && sort_by) {
      if (!sort_orders.includes(sort_order) || !sort_types.includes(sort_by)) {
        return {
          status: 400,
          data: { error: `Invalid 'sort_order' or 'sort_by'. 'sort_by' options are '${sort_types.join(`', '`)}'. 'sort_order' options are '${sort_orders.join(`', '`)}'.` },
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
      if (sort_order === "desc") pipeline.push({ $match: { _id: { $lt: new mongoose.Types.ObjectId(last_loaded) } } });
      else pipeline.push({ $match: { _id: { $gt: new mongoose.Types.ObjectId(last_loaded) } } });
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
          data: { error: `'created_after' must be a valid date: YYYY-MM-DD.` },
        };
      }
      pipeline.push({ $match: { created_at: { $gte: new Date(date) } } });
    }
    if (created_before) {
      const date = Date.parse(created_before);
      if (isNaN(date)) {
        return {
          status: 400,
          data: { error: `'created_before' must be a valid date: YYYY-MM-DD.` },
        };
      }
      const datePlusConst = new Date(date).getTime() + FULL_DAY_MINUS_ONE_MILLISECOND;
      pipeline.push({ $match: { created_at: { $lte: new Date(datePlusConst) } } });
    }
    if (is_official != undefined) {
      pipeline.push({ $match: { is_official: is_official } });
    }

    pipeline.push({
      $project: {
        owner: 1,
        _id: 1, // Include the ID if needed
        name: 1, // Include the 'name' field
        description: 1, // Include the 'description' field
        subscribers_count: { $size: "$subscribers" }, // Get the size of the 'subscribers' array
        squeals_count: { $size: "$squeals" },
        is_blocked: 1,
        created_at: 1, // Include the 'created_at' field
        is_official: 1, // Include the 'is_official' field
        //immagine: 1,
        // Add other fields you want to include here
      },
    });
    let subscribers_lower;
    if (min_subscribers !== undefined) {
      const int_min_subscribers = parseInt(min_subscribers);
      if (isNaN(int_min_subscribers)) {
        return {
          status: 400,
          data: { error: `'min_subscribers' must be an number.` },
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
          data: { error: `'max_subscribers' must be an number.` },
        };
      }
      pipeline.push({ $match: { subscribers_count: { $lte: int_max_subscribers } } });
      if (subscribers_lower !== undefined && int_max_subscribers < subscribers_lower) {
        return {
          status: 400,
          data: { error: `'max_subscribers' must be greater or equal than 'min_subscribers'.` },
        };
      }
    }
    if (min_squeals !== undefined) {
      const int_min_squeals = parseInt(min_squeals);
      if (isNaN(int_min_squeals)) {
        return {
          status: 400,
          data: { error: `'min_squeals' must be an number.` },
        };
      }
      pipeline.push({ $match: { squeals_count: { $gte: int_min_squeals } } });
    }
    if (max_squeals !== undefined) {
      const int_max_squeals = parseInt(max_squeals);
      if (isNaN(int_max_squeals)) {
        return {
          status: 400,
          data: { error: `'max_squeals' must be an number.` },
        };
      }
      if (min_squeals !== undefined && int_max_squeals < parseInt(min_squeals)) {
        return {
          status: 400,
          data: { error: `'max_squeals' must be greater or equal than 'min_squeals'.` },
        };
      }
      pipeline.push({ $match: { squeals_count: { $lte: int_max_squeals } } });
    }

    if (sort_order && sort_by) {
      const order = sort_order === "asc" ? 1 : -1;

      if (sort_by === "name") pipeline.push({ $sort: { name: order } });
      if (sort_by === "date") pipeline.push({ $sort: { created_at: order } });
      if (sort_by === "squeals") pipeline.push({ $sort: { squeals_count: order } });
      if (sort_by === "subscribers") pipeline.push({ $sort: { subscribers_count: order } });
    }

    if (!pag_size) {
      pag_size = DEFAULT_PAGE_SIZE;
    } else {
      pag_size = parseInt(pag_size);
      if (isNaN(pag_size || pag_size <= 0 || pag_size > MAX_PAGE_SIZE)) {
        return {
          status: 400,
          data: { error: `'pag_size' must be a number between 1 and 100.` },
        };
      }
    }
    pipeline.push({ $limit: pag_size });

    const data = await Channel.aggregate(pipeline).exec();

    let result = data;

    // Add subscription_status and is_editor fields to all channels if the token is valid
    if (is_token_valid) {
      const subscribed_channels = reqSender?.subscribed_channels;
      const editors_channels = reqSender?.editor_channels;
      result = data.map((channel) => {
        return {
          ...channel,
          subscription_status: subscribed_channels?.includes(channel._id),
          is_editor: editors_channels?.includes(channel._id) || channel.owner.toString() == reqSender._id.toString(),
        };
      });
    }

    if (result.length <= 0) {
      return {
        status: 404,
        data: { error: `No channels found.` },
      };
    }
    return {
      status: 200,
      data: result,
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

    if (!ownerUser.is_active) {
      return {
        status: 403,
        data: { error: `You are not allowed to create a channel if you're banned.` },
      };
    }

    if (is_official && ![true, false, "true", "false"].includes(is_official)) {
      return {
        status: 400,
        data: { error: `'is_official' must be either 'true' or 'false'.` },
      };
    }
    const is_official_bool = is_official == "true" ? true : is_official == "false" ? false : is_official;

    if (is_official_bool && ownerUser.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You are not allowed to create an official channel.` },
      };
    }

    if (can_mute && ![true, false, "true", "false"].includes(can_mute)) {
      return {
        status: 400,
        data: { error: `'can_mute' must be either 'true' or 'false'.` },
      };
    }
    const can_mute_bool = can_mute == "false" ? false : true;

    if (!is_official_bool && !can_mute_bool) {
      return {
        status: 403,
        data: { error: `You can't create an unofficial channel that can't be muted.` },
      };
    }

    if (!name) {
      return {
        status: 400,
        data: { error: `'name' is required` },
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
        data: { error: `'Description' is required.` },
      };
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        status: 400,
        data: { error: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters long, yours is ${description.length}.` },
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
          data: { error: `Channel name already exists.` },
        };
      } else {
        console.error(err);
        throw new Error(`Failed to create channel.`);
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
        data: { error: `Channel 'identifier' is required.` },
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
    let channel = response.data;

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
    // If the channel is blocked and the user is not a moderator or if the token is not valid and the channel is not official.
    if ((isTokenValid && channel.is_blocked && user?.account_type !== "moderator") || (!isTokenValid && !channel.is_official)) {
      return {
        status: 404,
        data: { error: `Channel not found.` },
      };
    }
    let subscription_status = user?.subscribed_channels.includes(channel._id);
    let is_editor = user?.editor_channels.includes(channel._id) || channel.owner.toString() == user?._id.toString();
    let is_muted = user?.preferences.muted_channels.includes(channel._id);
    const result = {
      ...channel.toObject(),
      subscription_status: subscription_status,
      is_editor: is_editor,
      is_muted_by_user: is_muted,
    };

    return {
      status: response.status,
      data: result,
    };
  },

  getChannelSubscriptionStatus: async (options) => {
    const { identifier, user_id } = options;

    let response = await findChannel(identifier, true, true);
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

    if (channel.subscribers.includes(user._id)) {
      return {
        status: 200,
        data: { outcome: "true", message: `You are subscribed to this channel.` },
      };
    } else {
      return {
        status: 200,
        data: { outcome: "false", message: `You are not subscribed to this channel.` },
      };
    }
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
        data: { error: `You don't have the permission to delete this channel.` },
      };
    }

    //remove the channel from the database with my custom delete function
    await channel.Delete();

    return {
      status: 200,
      data: { message: `Channel deleted.` },
    };
  },

  /**
   * @param options.identifier Channel's identifier, can be either the name or the id
   * @param options.inlineReqJson.editors_array
   * @param options.inlineReqJson.new_name
   * @param options.inlineReqJson.new_description
   * @param options.inlineReqJson.new_owner
   */
  //TESTED
  updateChannel: async (options) => {
    const { identifier, user_id } = options;
    const { editors_array, new_name, new_description, new_owner } = options.inlineReqJson;

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

    if (!user._id.equals(channel.owner) && !channel.editors.map((editor) => editor.toString()).includes(user._id.toString()) && user.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You don't have the permission to update this channel.` },
      };
    }

    if (!editors_array && !new_name && !new_description && !new_owner) {
      return {
        status: 400,
        data: { error: `No update parameters specified.` },
      };
    }

    // If the request includes a new name for the channel, check the permissions, check that it is valid, check that it does not already exist and update the name
    if (new_name) {
      if (channel.is_official && !officialChannelNameRegex.test(new_name)) {
        //check if the name is lowercase, alphanumeric and between 5 and 23 characters
        return {
          status: 400,
          data: {
            error: `Official channels must be uppercase, space-free and between ${OFFICIAL_CHANNEL_NAME_MIN_LENGTH} and ${OFFICIAL_CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
          },
        };
      }

      if (!channel.is_official && !channelNameRegex.test(new_name)) {
        return {
          status: 400,
          data: {
            error: `Unofficial channels must be lowercase, space-free and between ${CHANNEL_NAME_MIN_LENGTH} and ${CHANNEL_NAME_MAX_LENGTH} characters. It can only contain alphanumeric characters and underscore.`,
          },
        };
      }

      // Check if the name already exists
      response = await findChannel(new_name);
      if (response.status < 300) {
        //se esiste già
        return {
          status: 409,
          data: {
            error: `Channel name already exists.`,
          },
        };
      }
      // If it doesn't already exist
      channel.name = new_name;
    }
    // Modify editors or owner
    if (editors_array) {
      // Change editors
      let response = checkIfArrayIsValid(editors_array);
      if (!response.isValid) {
        return {
          status: 400,
          data: { error: `Incorrect 'editors_array' format.` },
        };
      }
      const parsedEditors_array = response.value;

      let data = await checkForAllUsers(parsedEditors_array);
      if (!data.usersOutcome) {
        e; // If they don't exist, return an error
        return {
          status: 404,
          data: { error: `Users not valid.` },
        };
      }
      const editorsIds = data.usersArray.map((user) => user._id);

      // If the owner is among the editors, return an error
      if (editorsIds.some((editorId) => editorId.toString() === channel.owner.toString())) {
        return {
          status: 400,
          data: { error: `The owner of the channel can't be an editor.` },
        };
      }
      // If there is an editor already present among the editors, return an error
      //if (editorsIds.some((editorId) => channel.editors.map((editor) => editor.toString()).includes(editorId.toString()))) {
      //  return {
      //    status: 400,
      //    data: { error: `One or more editors are already editors of this channel.` },
      //  };
      //}

      // Check if the editors exist
      const { added, removed } = addedAndRemoved(channel.editors, editorsIds);

      // if (added.length >= 0 && removed.length >= 0) {
      //   if (!(user._id.equals(channel.owner) || user.account_type == "moderator" || (removed.length == 1 && added.length == 0 && removed[0].equals(user._id)))) {
      //     return {
      //       status: 403,
      //       data: { error: `You don't have the permission to change editors in this channel.` },
      //     };
      //   }
      // }

      const addedUserPromises = added.map(async (user) => {
        await User.updateOne({ _id: user }, { $push: { editor_channels: channel._id } });
      });

      const removedUserPromises = removed.map(async (user) => {
        await User.updateOne({ _id: user }, { $pull: { editor_channels: channel._id } });
      });

      // Wait for all promises to be resolved
      await Promise.all([...addedUserPromises, ...removedUserPromises]);

      if (added.length > 0) {
        added.forEach(async (user) => {
          const notification = new Notification({
            content: newEditorForChannelNotification(channel.name),
            user_ref: user,
            channel_ref: channel._id,
            created_at: Date.now(),
            source: "channel",
            id_code: "newEditor",
          });
          await notification.save();
          User.findByIdAndUpdate(user._id, { $push: { notifications: notification._id } }).exec();
        });
      }
      if (removed.length > 0) {
        removed.forEach(async (user) => {
          const notification = new Notification({
            content: removedEditorForChannelNotification(channel.name),
            user_ref: user,
            channel_ref: channel._id,
            created_at: Date.now(),
            source: "channel",
            id_code: "removedEditor",
          });
          await notification.save();
          User.findByIdAndUpdate(user._id, { $push: { notifications: notification._id } }).exec();
        });
      }

      // Update editors
      channel.editors = editorsIds;
    }
    // Change the owner
    if (new_owner) {
      if (!(user._id.equals(channel.owner) || user.account_type == "moderator")) {
        return {
          status: 403,
          data: { error: `You don't have the permission to change the owner of this channel.` },
        };
      }
      // Check if the new owner exists
      let response = await findUser(new_owner);
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
        // If the owner doesn't exist, return an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const oldOwnerUser = response.data;

      // If the new owner is already the owner of the channel, return an error
      if (newOwnerUser._id.equals(channel.owner)) {
        return {
          status: 400,
          data: { error: `The new owner is already the owner of this channel.` },
        };
      }

      // If the new owner was an editor of the channel , remove him from the editors
      if (channel.editors.includes(newOwnerUser._id)) {
        //includes funziona
        channel.editors.pull(newOwnerUser._id);
        newOwnerUser.editor_channels.pull(channel._id);
      }

      channel.owner = newOwnerUser._id;

      newOwnerUser.owned_channels.push(channel._id);
      oldOwnerUser.owned_channels.pull(channel._id);

      //send notifications to the new owner and the old owner
      const notificationNewOwner = new Notification({
        content: newOwnerNotification(newOwnerUser.username, channel.name),
        user_ref: newOwnerUser._id,
        channel_ref: channel._id,
        created_at: Date.now(),
        source: "channel",
        id_code: "newOwner",
      });
      await notificationNewOwner.save();
      newOwnerUser.notifications.push(notificationNewOwner._id);

      const notificationOldOwner = new Notification({
        content: removedOwnerNotification(oldOwnerUser.username, channel.name),
        user_ref: oldOwnerUser._id,
        channel_ref: channel._id,
        created_at: Date.now(),
        source: "channel",
        id_code: "newOwner",
      });
      await notificationOldOwner.save();
      oldOwnerUser.notifications.push(notificationOldOwner._id);

      await newOwnerUser.save();
      await oldOwnerUser.save();
    }

    channel.description = new_description || channel.description;

    await channel.save();
    return {
      status: 200,
      data: channel,
    };
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
        data: { error: `You're not an editor of this channel.` },
      };
    }

    channel.editors.pull(user._id);
    user.editor_channels.pull(channel._id);

    await channel.save();
    await user.save();

    return {
      status: 200,
      data: { message: `You left the mod team.` },
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

    // Check if the channel exists
    response = await findChannel(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const channel = response.data;

    // Check if the user is a moderator or the owner of the channel or an editor
    if (!(user.account_type == "moderator" || channel.owner.equals(user._id) || channel.editors.includes(user._id))) {
      return {
        status: 403,
        data: { error: `You don't have the permission to remove squeals from this channel.` },
      };
    }

    // Check if the squeal exists
    response = await findSqueal(squealIdentifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const squeal = response.data;

    // Chech if the squeal is in the channel
    if (!channel.squeals.includes(squeal._id)) {
      return {
        status: 404,
        data: { error: `Squeal not found in this channel.` },
      };
    }

    // Remove the squeal from the channel and the channel from the squeal
    channel.squeals.pull(squeal._id);
    squeal.recipients.channels.pull(channel._id);
    await channel.save();
    await squeal.save();
    return {
      status: 200,
      data: { message: `Squeal removed from channel.` },
    };
  },

  /**
   * Toggle is_blocked field in user object, means that the channel is blocked or not
   * @param options.identifier Channel's identifier, can be either username or userId
   * @param options.value Query value which can be either "true"  or "false"
   */
  //TESTED
  channelBlockedStatus: async (options) => {
    //TESTED
    const { identifier, user_id, value } = options; //options.user_id is the Request sender's user id

    if (!value) {
      return {
        status: 400,
        data: { error: `Channel blocked status 'value' is required.` },
      };
    }

    if (!["true", "false"].includes(value)) {
      return {
        status: 400,
        data: { error: `Channel blocked status value must be either 'true' or 'false'.` },
      };
    }

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid.` },
      };
    }
    const user = response.data;

    // Check if the user is a moderator
    if (user.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You don't have the permission to block/unblock a channel.` },
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
    channel.is_blocked = value === "true" ? true : false;

    //send notification to the channel owner
    const notification = new Notification({
      content: channel.is_blocked ? bannedChannelNotification(channel.name) : unbannedChannelNotification(channel.name),
      user_ref: channel.owner,
      channel_ref: channel._id,
      created_at: Date.now(),
      source: "system",
      id_code: "banStatusUpdate",
    });

    await notification.save();
    await User.findByIdAndUpdate(channel.owner, { $push: { notifications: notification._id } }).exec();

    // Return the result
    await channel.save();
    return {
      status: 200,
      data: channel,
    };
  },

  /**
   * Toggle channel mute status by ID or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   * @param options.value Query value which can be either "true" or "false"
   */
  //TESTED
  channelMuteStatus: async (options) => {
    const { identifier, user_id, value } = options;
    //Check if value is correct
    if (!value) {
      return {
        status: 400,
        data: { error: `'value' is required.` },
      };
    }

    if (!["true", "false"].includes(value)) {
      return {
        status: 400,
        data: { error: `'value' must be either 'true' or 'false'.` },
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
        data: { error: `You are not allowed to mute/unmute this channel.` },
      };
    }

    //if they want to mute it, check if they're subscribed to it
    if (value_bool) {
      if (!user.subscribed_channels.includes(channel._id)) {
        return {
          status: 403,
          data: { error: `You can't mute a channel you're not subscribed to.` },
        };
      }
      if (user.preferences.muted_channels.includes(channel._id)) {
        return {
          status: 403,
          data: { error: `You can't mute a channel you already muted.` },
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
          data: { error: `You can't unmute a channel you didn't mute.` },
        };
      }
      if (!user.preferences.muted_channels.includes(channel._id)) {
        return {
          status: 403,
          data: { error: `You can't unmute a channel you didn't mute.` },
        };
      }
      //otherwise, remove it from the muted channels array
      user.preferences.muted_channels.pull(channel._id);
    }

    await user.save();
    return {
      status: 200,
      data: { message: `Channel muted/unmuted.` },
    };
  },

  /**
   * Toggle channel subscription  by ID or channel name
   * @param options.identifier Channel's identifier, can be either id or name
   * @param options.value Query value which can be either "true" or "false"
   */
  //TESTED
  channelSubscription: async (options) => {
    const { identifier, value, user_id } = options;
    //Check if value is correct
    if (!value) {
      return {
        status: 400,
        data: { error: `'value' is required.` },
      };
    }

    if (!["true", "false"].includes(value)) {
      return {
        status: 400,
        data: { error: `'value' must be either 'true' or 'false'.` },
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
      //if the user had muted the channel, remove it from the muted channels array
      user.preferences.muted_channels.pull(channel._id);
      channel.subscribers.pull(user._id);
      await user.save();
      await channel.save();
      return {
        status: 200,
        data: { message: `User unsubscribed to the channel.` },
      };
    }
    //if value is true and the user is not subscribed to that channel, subscribe them
    if (value_bool && !user.subscribed_channels.includes(channel._id)) {
      user.subscribed_channels.push(channel._id);
      channel.subscribers.push(user._id);
      await user.save();
      await channel.save();
      return {
        status: 200,
        data: { message: `User subscribed to the channel.` },
      };
    }

    //if you're already subscribed to the channel and you want to subscribe to it again
    if (value_bool && user.subscribed_channels.includes(channel._id)) {
      return {
        status: 400,
        data: { message: `User already subscribed to the channel.` },
      };
    }

    //if you're not subscribed to the channel and you want to unsubscribe to it again
    return {
      status: 400,
      data: { message: `User not subscribed to the channel.` },
    };
  },
};
