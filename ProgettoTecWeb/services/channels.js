const mongoose = require("mongoose");
const schema = require("./schemas");
const channelNameRegex = /^[a-z0-9_]{5,23}$/;
const officialChannelNameRegex = /^[A-Z0-9_]{5,23}$/;

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

    if (pipeline.length == 0) {
      //if no filters are specified, return all channels
      pipeline.push({ $match: {} });
    }
    console.log(pipeline);
    const data = await schema.Channel.aggregate(pipeline).exec();

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
    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    const { can_mute, creator, description, is_official, name } = options.channelInput;

    //TODO controllare i permessi per creare un canale dopo che abbiamo implementato l'autenticazione
    if (!creator) {
      return {
        status: 400,
        data: { error: "creator is required" },
      };
    }

    let creatorExists;
    //Check if creator exists
    if (creator.length == 24 && mongoose.isValidObjectId(creator)) {
      console.log("creator is a valid ObjectId");
      creatorExists = await schema.User.findById(creator);
    } else if (creator.length >= 4 && creator.length <= 20) {
      console.log("creator is a valid username");
      creatorExists = await schema.User.findOne({ username: creator });
      console.log("OK");
    } else {
      return {
        status: 400,
        data: { error: "Invalid identifier" },
      };
    }
    if (!creatorExists) {
      return {
        status: 400,
        data: { error: "Creator does not exists" },
      };
    }

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

    if (!channelNameRegex.test(name)) {
      //TODO controllare il regexp nel caso sia un canale ufficiale
      //check if the name is lowercase, alphanumeric and between 5 and 23 characters
      return {
        status: 400,
        data: { error: "name format not valid" },
      };
    }
    if (name.length === 24 && mongoose.isValidObjectId(name)) {
      return {
        status: 400,
        data: { error: "name cannot be an ObjectId" },
      };
    }
    const isNameDuplicate = await schema.Channel.findOne({ name: name });

    if (isNameDuplicate) {
      return {
        status: 400,
        data: { error: "name already exists" },
      };
    }

    if (!description) {
      return {
        status: 400,
        data: { error: "description is required" },
      };
    }

    //check if the name already exists in the database

    const newChannel = new schema.Channel({
      creator: creatorExists._id,
      name: name,
      description: description,
      is_official: is_official || false,
      can_mute: can_mute || true,
      created_at: Date.now(),
    });

    const data = await newChannel.save();

    return {
      status: 201,
      data: data,
    };
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
    if (identifier.length === 24 && mongoose.isValidObjectId(identifier)) {
      //it's an ObjectId
      data = await schema.Channel.findById(identifier);
    } else if (channelNameRegex.test(identifier)) {
      //it's a name
      data = await schema.Channel.findOne({ name: identifier });
    } else {
      return {
        status: 400,
        data: { error: "Invalid identifier" },
      };
    }
    if (!data) {
      return {
        status: 404,
        data: { error: "Channel not found" },
      };
    }
    return {
      status: 200,
      data: data,
    };
  },

  /**
   *
   * @param options.identifier Channel's identifier, can be either id or name
   */
  deleteChannel: async (options) => {
    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    var data = {},
      status = "200";

    return {
      status: status,
      data: data,
    };
  },
};
