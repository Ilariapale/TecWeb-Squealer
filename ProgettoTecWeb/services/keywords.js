const mongoose = require("mongoose");
const schema = require("./schemas");
const keywordRegex = /^[a-zA-Z0-9]{4,20}$/;

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
        data: { error: "name is required" },
      };
    }

    if (!keywordRegex.test(name)) {
      return {
        status: 400,
        data: { error: "name is not valid" },
      };
    }

    const newKeyword = new schema.Keyword({
      created_at: new Date(),
      name: name,
    });

    try {
      const result = await newKeyword.save();
      return {
        status: result ? 201 : 400,
        data: result ? { keyword: result } : { error: "Failed to create keyword" },
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
          data: { error: "Keyword already exists" },
        };
      } else {
        // generic or unknown error
        console.error(error);
        throw new Error("Failed to create keyword");
      }
    }
  },

  /**
   * Get a keyword object by name
   * @param options.identifier Identifier is the keyword's name
   */
  getKeyword: async (options) => {
    const { identifier } = options;
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Keyword identifier is required." },
      };
    }
    if (!keywordRegex.test(identifier)) {
      return {
        status: 400,
        data: { error: "Invalid identifier" },
      };
    }
    const data = await schema.Keyword.findOne({ name: identifier });
    if (!data) {
      return {
        status: 404,
        data: { error: "Keyword not found" },
      };
    }
    return {
      status: 200,
      data: { keyword: data },
    };
  },

  /**
   *
   * @param options.identifier Identifier is the keyword's name
   */
  deleteKeyword: async (options) => {
    const { identifier } = options;
    if (!identifier) {
      return {
        status: 400,
        data: { error: "Keyword identifier is required." },
      };
    }
    if (!keywordRegex.test(identifier)) {
      return {
        status: 400,
        data: { error: "Invalid identifier" },
      };
    }
    const data = await schema.Keyword.findOne({ name: identifier });
    if (!data) {
      return {
        status: 404,
        data: { error: "Keyword not found" },
      };
    }

    //delete the keyword from the squeals and from the db
    const updateSquealsPromises = [];
    for (const squeal of data.squeals) {
      let promise = schema.Squeal.findByIdAndUpdate(squeal, { $pull: { "recipient.keywords": identifier } });
      updateSquealsPromises.push(promise);
    }
    await Promise.all(updateSquealsPromises);

    //delete the keyword
    await schema.Keyword.deleteOne({ name: identifier });

    return {
      status: 200,
      data: { message: "Keyword deleted" },
    };
  },
};
