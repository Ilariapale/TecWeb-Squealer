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
   * Create a new keyword
   * @param options.keywordInput.name the name of the keyword
   */
  createKeyword: async (options) => {
    const { name } = options?.keywordInput;
    if (!name) {
      return {
        status: 400,
        data: { error: `name is required.` },
      };
    }

    if (!keywordRegex.test(name)) {
      return {
        status: 400,
        data: { error: `name is not valid.` },
      };
    }

    const newKeyword = new Keyword({
      created_at: new Date(),
      name: name,
    });

    try {
      const result = await newKeyword.save();
      return {
        status: result ? 201 : 400,
        data: result ? { keyword: result } : { error: `Failed to create keyword.` },
      };
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        // validation error
        const errorMessage = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
        return {
          status: 400,
          data: { error: errorMessage },
        };
      } else if (error.code === 11000) {
        // duplicate key error
        return {
          status: 409,
          data: { error: `Keyword already exists.` },
        };
      } else {
        // generic or unknown error
        console.error(error);
        throw new Error(`Failed to create keyword.`);
      }
    }
  },

  /**
   * Get a keyword object by name
   * @param options.identifier Identifier is the keyword's name
   */
  getKeyword: async (options) => {
    const { identifier } = options;
    let response = await findKeyword(identifier);
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
   * @param options.identifier Identifier is the keyword's name
   */
  deleteKeyword: async (options) => {
    const { identifier, user_id } = options;

    //check if the user is an admin
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;
    if (user.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You are not allowed to delete keywords.` },
      };
    }

    if (!identifier) {
      return {
        status: 400,
        data: { error: `Keyword 'identifier' is required.` },
      };
    }
    if (!keywordRegex.test(identifier)) {
      return {
        status: 400,
        data: { error: `Invalid 'identifier'.` },
      };
    }
    const keyword = await Keyword.findOne({ name: identifier });
    if (!keyword) {
      return {
        status: 404,
        data: { error: `Keyword not found.` },
      };
    }

    //delete the keyword from the squeals and from the db
    const updateSquealsPromises = [];
    for (const squeal of keyword.squeals) {
      let promise = Squeal.findByIdAndUpdate(squeal, { $pull: { "recipients.keywords": keyword.name } });
      updateSquealsPromises.push(promise);
    }
    await Promise.all(updateSquealsPromises);

    //delete the keyword
    await Keyword.deleteOne({ name: identifier });

    return {
      status: 200,
      data: { message: `Keyword deleted.` },
    };
  },
};
