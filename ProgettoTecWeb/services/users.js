const mongoose = require("mongoose");
const schema = require("./schemas");

//--------------------------------------------------------------------------

module.exports = {
  /**
   * Get users list filtering by creationDate and squeals count
   * @param options.createdAfter Filter users created after the specified date
   * @param options.createdBefore Filter users created before the specified date
   * @param options.maxSquealsCount Filters users with less than the specified number of squeals
   * @param options.minSquealsCount Filters users with more than the specified number of squeals
   **/
  getUserList: async (options) => {
    const pipeline = [];

    //TODO controllare che le date siano valide
    //check if the request has specified createdAfter or createdBefore
    if (options.createdAfter) {
      pipeline.push({ $match: { created_at: { $gte: new Date(options.createdAfter) } } });
    }

    if (options.createdBefore) {
      pipeline.push({ $match: { created_at: { $lte: new Date(options.createdBefore) } } });
    }
    //check if the request has specified maxSquealsCount or minSquealsCount
    if (options.maxSquealsCount || options.minSquealsCount) {
      const sizeMatch = {};
      if (options.maxSquealsCount) {
        if (options.maxSquealsCount < 0) {
          //return an error if the maxSquealsCount is negative
          return {
            status: 400,
            data: { error: "maxSquealsCount must be a positive integer" },
          };
        } else {
          sizeMatch.$lt = parseInt(options.maxSquealsCount);
        }
      }
      if (options.minSquealsCount) {
        if (options.minSquealsCount < 0) {
          return {
            //return an error if the minSquealsCount is negative
            status: 400,
            data: { error: "minSquealsCount must be a positive integer" },
          };
        } else {
          sizeMatch.$gt = parseInt(options.minSquealsCount);
        }
      }
      pipeline.push({ $match: { squeals: { $exists: true, $expr: { $size: sizeMatch } } } });
    }
    if (pipeline.length == 0) {
      //if no filters are specified, return all users
      pipeline.push({ $match: {} });
    }

    //execute the query
    const data = await schema.User.aggregate(pipeline).exec();
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
        data: { error: "No users found." },
      };
    }
  },

  /**
  * Create a new user

  * @param options.userInput.email Email used at sign up
  * @param options.userInput.password Account password
  * @param options.userInput.username Unique identifier of any given account

  */
  createUser: async (options) => {
    // Check if the required fields are present
    if (!options.userInput.username || !options.userInput.email || !options.userInput.password) {
      return {
        status: 400,
        data: { error: "Username email and password are required" },
      };
    }

    if (options.userInput.username.length < 4 || options.userInput.username.length > 20) {
      return {
        status: 400,
        data: { error: "Username must be between 4 and 20 characters" },
      };
    }

    // Create the object to save
    const newUser = new schema.User({
      username: options.userInput.username,
      email: options.userInput.email,
      password: options.userInput.password,
      created_at: Date.now(),
    });

    try {
      // Save the new user
      const result = await newUser.save();

      // return the result
      return {
        status: result ? 201 : 400,
        data: result ? { user: result } : { error: "Failed to create user" },
      };
    } catch (error) {
      //Handling mongoose errors
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
          data: { error: "Username or email already exists" },
        };
      } else {
        // generic or unknown error
        console.error(error);
        throw new Error("Failed to create user");
      }
    }
  },

  /**
  * Get a user object by ID or by username, or user profile
  * @param options.identifier User's identifier, can be either username or userId 

  */
  getUser: async (options) => {
    const { identifier } = options;
    var data;

    // Check if the required fields are present
    if (!identifier) {
      return {
        status: 400,
        data: { error: "User identifier is required." },
      };
    }
    try {
      //check weather the identifier is a valid ObjectId
      if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
        data = await schema.User.findById(identifier);
        //or a username
      } else if (identifier.length >= 4 && identifier.length <= 20) {
        data = await schema.User.findOne({ username: identifier });
        //otherwise return an error
      } else {
        return {
          status: 400,
          data: { error: "Invalid identifier" },
        };
      }
    } catch (err) {
      // if an error occurs, return an error
      throw new Error("Failed to get user. Please try again later.");
    }

    return {
      status: 200,
      data: data,
    };
  },

  /**
  * 
  * @param options.identifier User's identifier, can be either username or userId 

  */
  deleteUser: async (options) => {
    //TODO decidere se cancellare anche i post e o i canali che ha creato
    // Check if the required fields are present
    const { identifier } = options;
    if (!identifier) {
      return {
        status: 400,
        data: { error: "User identifier is required." },
      };
    }
    var deletedUser;
    try {
      //check weather the identifier is a valid ObjectId or a username
      if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
        deletedUser = await schema.User.findByIdAndDelete(identifier);
      } else if (identifier.length >= 4 && identifier.length <= 20) {
        deletedUser = await schema.User.findOneAndDelete({ username: identifier });
      } else {
        //otherwise return an error
        return {
          status: 400,
          data: { error: "Invalid identifier" },
        };
      }
      //check if the user exists, otherwise return an error
      if (!deletedUser) {
        return {
          status: 404,
          data: { error: "User not found." },
        };
      }
      // return the result
      return {
        status: 200,
        data: { message: "User deleted successfully" },
      };
    } catch (err) {
      // if an error occurs, return an error
      throw new Error("Failed to delete user. Please try again later.");
    }
  },

  /**
   *
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.updateProfileInlineReqJson.password New user's password
   * @param options.updateProfileInlineReqJson.profile_info New user's profile info
   * @param options.updateProfileInlineReqJson.profile_picture new user's profile picture
   */
  updateProfile: async (options) => {
    const { identifier, updateProfileInlineReqJson } = options;
    // Check if the required fields are present
    if (!identifier) {
      return {
        status: 400,
        data: { error: "User identifier is required." },
      };
    }
    if (!updateProfileInlineReqJson.password && !updateProfileInlineReqJson.profile_info && !updateProfileInlineReqJson.profile_picture) {
      return {
        status: 400,
        data: { error: "No fields to update" },
      };
    }
    try {
      let updatedUser;
      // Check if the identifier is a valid ObjectId or a username
      if (identifier.length == 24 && mongoose.isValidObjectId(identifier)) {
        updatedUser = await schema.User.findByIdAndUpdate(identifier, { $set: updateProfileInlineReqJson }, { new: true });
      } else if (identifier.length >= 4 && identifier.length <= 20) {
        updatedUser = await schema.User.findOneAndUpdate({ username: identifier }, { $set: updateProfileInlineReqJson }, { new: true });
      } else {
        // Otherwise return an error
        return {
          status: 400,
          data: { error: "Invalid identifier" },
        };
      }
      // Check if the user exists, otherwise return an error
      if (!updatedUser) {
        return {
          status: 404,
          data: { error: "User not found." },
        };
      }
      // Return the result
      return {
        status: 200,
        data: updatedUser,
      };
    } catch (err) {
      throw new Error("Failed to update user. Please try again later.");
    }
  },
};
