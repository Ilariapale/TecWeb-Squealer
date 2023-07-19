const mongoose = require("mongoose");
const schema = require("./schemas");

module.exports = {
  /**
   * Retrieve squeals with optional filters
   * @param options.contentType Filter squeals by content type (text, image, video, position)
   * @param options.createdAfter Filter squeals created after the specified date
   * @param options.createdBefore Filter squeals created before the specified date
   * @param options.isScheduled Filter squeals by scheduled status
   * @param options.minReactions Filter squeals with more than n total reactions
   */
  getSqueals: async (options) => {
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
    // throw new Error('<Error message>');
    // this will result in a 500
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
      pipeline.push({ $match: { is_scheduled: options.isScheduled } });
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
    const data = await schema.Squeal.aggregate(pipeline).exec();
    //check if the query returned any result
    if (data.length > 0) {
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
   * @param options.squealInput.user_id Squeal creator's id
   * @param options.squealInput.content_type Type of the squeal content, it can be "text", "image", "video" or "position"
   * @param options.squealInput.content Squeal content based on the content_type, fill it in content.text, an content.image, content.video or content.position
   * @param options.squealInput.is_scheduled It tells you whether or not the squeal is scheduled
   * @param options.squealInput.recipients Array of users, channels or keywords, with no limit and no impact on the quota.
   */
  createSqueal: async (options) => {
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
    /**/

    //TODO
    //una volta che ho aggiunto lo squeal al db e all'utente, devo aggiungerlo anche ai canali e agli utenti che lo hanno ricevuto

    var { user_id, content_type, content, is_scheduled, recipients } = options.squealInput;
    const validContentTypes = ["text", "image", "video", "position", "deleted"];

    //set the default value for content_type
    content_type = content_type || "text";
    //check if the content_type is valid
    if (!validContentTypes.includes(content_type)) {
      return {
        status: 400,
        data: { error: "Invalid content_type." },
      };
    }

    //check if the content is specified and correctly formatted
    if (!content) {
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

    //CHECK FOR USERS
    const userPromises = users.map((user) => {
      let query;
      if (user.length == 24 && mongoose.isValidObjectId(user)) {
        query = { _id: user };
      } else if (user.length >= 4 && user.length <= 20) {
        query = { username: user };
      } else {
        return false;
      }
      return schema.User.exists(query);
    });
    const userResults = await Promise.all(userPromises);
    const allUserExist = userResults.every((exists) => exists); // true if all users exist

    if (!allUserExist) {
      return {
        status: 404,
        data: { error: "One or more users not found." },
      };
    }

    //CHECK FOR CHANNELS
    const channelPromises = channels.map((channel) => {
      let query;
      if (channel.length == 24 && mongoose.isValidObjectId(channel)) {
        query = { _id: channel };
      } else if (channel.length >= 4 && channel.length <= 20) {
        query = { name: channel };
      } else {
        return false;
      }
      return schema.Channel.exists(query);
    });

    const channelResults = await Promise.all(channelPromises);
    const allChannelExist = channelResults.every((exists) => exists); // true if all channels exist

    if (!allChannelExist) {
      return {
        status: 404,
        data: { error: "One or more channels not found." },
      };
    }

    //CHECK FOR THE USER_ID OF THE AUTHORS
    if (!user_id) {
      return {
        status: 400,
        data: { error: "Missing 'user_id' parameter." },
      };
    }

    //check in the db if the user_id is valid
    let userExists;
    console.log("user_id: " + user_id);
    if (user_id.length == 24 && mongoose.isValidObjectId(user_id)) {
      console.log("user_id is a valid ObjectId");
      userExists = await schema.User.findById(user_id);
    } else if (user_id.length >= 4 && user_id.length <= 20) {
      console.log("user_id is a valid username");
      userExists = await schema.User.findOne({ username: user_id });
    } else {
      console.log("user_id is not valid");
      return {
        status: 400,
        data: { error: "Invalid 'user_id' parameter." },
      };
    }
    if (!userExists) {
      return {
        status: 404,
        data: { error: "User not found." },
      };
    } //else we have a valid user_id, and we can refer to it as userExists._id

    //create the hex_id from the length of the user squeals array
    hex_id = userExists?.squeals?.posted?.length || 0;

    const newSqueal = new schema.Squeal({
      hex_id: hex_id,
      user_id: userExists._id,
      is_scheduled: is_scheduled || false,
      content_type: content_type,
      content: content,
      recipients: {
        users: userResults,
        channels: channelResults,
        keywords: keywords,
      },
      created_at: new Date(),
      reactions: {
        positive_reactions: 0,
        negative_reaction: 0,
        like: [],
        laugh: [],
        love: [],
        dislike: [],
        disagree: [],
        disgust: [],
      },
      impressions: 0,
    });

    //save the squeal in the db
    let result = await newSqueal.save();

    //push teh squeal in the user squeals array
    await schema.User.findByIdAndUpdate(result.user_id, { $push: { "squeals.posted": result._id } });

    return {
      status: result ? 201 : 400,
      data: result ? { squeal: result } : { error: "Failed to create squeal" },
    };
  },

  /**
   * Get a squeal object by ID or by id, or squeal HEX
   * @param options.identifier Squeal's identifier, can be either id or HEX
   */
  getSqueal: async (options) => {
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

    var data = {
        _id: "<string>",
        content: "<object>",
        content_type: "<string>",
        created_at: "<date-time>",
        hex_id: "<number>",
        impressions: "<number>",
        is_scheduled: "<boolean>",
        reactions: "<object>",
        recipients: "<array>",
        user_id: "<string>",
      },
      status = "200";

    return {
      status: status,
      data: data,
    };
  },

  /**
   *
   * @param options.identifier Squeal's identifier, can be either id
   */
  deleteSqueal: async (options) => {
    //TODO decidere se eliminare i destinatari e o i canali
    const { identifier } = options;
    let data;
    //check if the identifier is specified
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Missing 'identifier' parameter." },
      };
    }

    if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
      data = await schema.Squeal.findByIdAndUpdate(identifier, { $set: { content_type: "deleted", content: "[deleted]" } });
    } else {
      return {
        status: 400,
        data: { error: "Invalid 'identifier' parameter." },
      };
    }
    return {
      status: 200,
      data: data,
    };
  },
};
