const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const {
  jwt,
  bcrypt,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  securityLvl,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
} = require("./utils");
const welcomeNotification = "Welcome to Squealer! Check out your first squeal by clicking on the notification.";
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
    pipeline.push({ $match: { isActive: true } });

    //execute the query
    const data = await User.aggregate(pipeline).exec();
    //check if the query returned any result
    if (data.length <= 0) {
      // return an error
      return {
        status: 404,
        data: { error: "No users found." },
      };
    }
    return {
      status: 200,
      data: data,
    };
  },

  /**
   * Create a new user
   * @param options.userInput.email Email used at sign up
   * @param options.userInput.password Account password
   * @param options.userInput.username Unique identifier of any given account
   */
  createUser: async (options) => {
    const { username, email, password } = options.userInput;
    // Check if the required fields are present
    if (!username || !email || !password) {
      return {
        status: 400,
        data: { error: "Username email and password are required" },
      };
    }

    if (!usernameRegex.test(username)) {
      return {
        status: 400,
        data: { error: "Username format is not valid" },
      };
    }

    //-----------PASSWORD ENCRYPTION----------------

    const salt = await bcrypt.genSalt(securityLvl);
    const hashedPassword = await bcrypt.hash(password, salt);

    //------------------------------------------------

    // Create the object to save
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      created_at: Date.now(),
    });

    try {
      // Save the new user
      const user = await newUser.save();
      if (!user) {
        return {
          status: 400,
          data: { error: "Failed to create user" },
        };
      }
      // Create the first squeal and save it
      const newSqueal = new Squeal({
        hex_id: 0,
        user_id: user._id,
        content_type: "text",
        content: "Welcome to Squealer, " + user.username + "!",
        created_at: Date.now(),
      });
      const firstSqueal = await newSqueal.save();

      //create the notification and save it
      const newNotification = new Notification({
        squeal_ref: firstSqueal._id,
        created_at: Date.now(),
        content: welcomeNotification,
      });
      const notification = await newNotification.save();

      // Update the user with the new squeal and the new notification
      const response = await User.findByIdAndUpdate(
        user._id,
        {
          $push: { squeals: firstSqueal._id },
          $push: { notifications: notification._id },
        },
        { new: true }
      );

      // return the new user
      return {
        status: response ? 201 : 400,
        data: response ? response : { error: "Failed to create user" },
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
    //TODO RIFARE ASSOLUTAMENTE
    const { identifier } = options;
    var response;
    // Check if the required fields are present
    if (!identifier) {
      return {
        status: 400,
        data: { error: "User identifier is required." },
      };
    }
    try {
      response = await findUser(identifier);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
    } catch (err) {
      // if an error occurs, return an error
      throw new Error("Failed to get user. Please try again later.");
    }

    return {
      status: 200,
      data: response.data,
    };
  },

  /**
   *  Delete a user object by ID or by username
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
      // if (mongooseObjectIdRegex.test(identifier)) {
      //   deletedUser = await User.findById(identifier);
      // } else if (usernameRegex.test(identifier)) {
      //   deletedUser = await User.findOne({ username: identifier });
      // } else {
      //   //otherwise return an error
      //   return {
      //     status: 400,
      //     data: { error: "Invalid identifier" },
      //   };
      // }

      let response = await findUser(identifier);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }

      deletedUser = response.data;

      //----------------------------------------------------------------------------------------------------------------------
      // Removing all the references to the user from the other collections

      const postedSqueals = deletedUser.squeals.posted;
      const scheduledSqueals = deletedUser.squeals.scheduled;

      await Promise.all(
        //squeal by squeal
        postedSqueals.map(async (squeal) => {
          // Remove the reference of the squeal from the "squeals" array of all the users
          await User.updateMany({}, { $pull: { mentioned_in: squeal } });

          // Remove the reference of the squeal from the "squeals" array of all the channels
          await Channel.updateMany({}, { $pull: { squeals: squeal } });

          // Remove the reference of the squeal from the "squeals" array of all the keywords
          await Keyword.updateMany({}, { $pull: { squeals: squeal } });

          // Remove the squeal from the database
          await Squeal.findByIdAndRemove(squeal);
        })
      );
      // remove the reference of the user from the "recipients.users" array of all the squeals
      await Squeal.updateMany({}, { $pull: { "recipients.users": deletedUser._id } });
      await Channel.updateMany({});
      // trova tutte le notifiche associate all'utente
      const notifications = deletedUser.notifications;

      await Promise.all(
        // Notification by notification
        notifications.map(async (notification) => {
          // Remove the notification from the database
          await Notification.findByIdAndRemove(notification);
        })
      );

      // Set the user as inactive and change the username to the _id
      //await User.findByIdAndUpdate(utenteId, { $set: { isActive: false }, $set: { username: deletedUser._id } });
      //await User.findByIdAndRemove(deletedUser._id);
      await deletedUser.deleteOne();
      return {
        status: 200,
        data: { message: "User deleted successfully" },
      };

      //----------------------------------------------------------------------------------------------------------------------
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
      if (mongooseObjectIdRegex.test(identifier)) {
        updatedUser = await User.findByIdAndUpdate(identifier, { $set: updateProfileInlineReqJson }, { new: true });
      } else if (usernameRegex.test(identifier)) {
        updatedUser = await User.findOneAndUpdate({ username: identifier }, { $set: updateProfileInlineReqJson }, { new: true });
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
