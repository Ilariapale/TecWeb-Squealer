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
  checkForAllNotifications,
} = require("./utils");
const welcomeNotification = "Welcome to Squealer! Check out your first squeal by clicking on the notification.";
//--------------------------------------------------------------------------
//TODO funzione per cambiare il tipo di account e funzione per impostare il SMM
//TODO quando un account viene cancellato, se quell'account possedeva canali, questi vengono passati al primo dei editors, se non ne ha il canale viene cancellato
//TODO quando un account viene cancellato, se quell'account era admin
module.exports = {
  /**
   * Get users list filtering by creationDate and squeals count
   * @param options.createdAfter Filter users created after the specified date
   * @param options.createdBefore Filter users created before the specified date
   * @param options.maxSquealsCount Filters users with less than the specified number of squeals
   * @param options.minSquealsCount Filters users with more than the specified number of squeals
   * @param options.user_id Request sender's user id
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

    //check for the request sender's role
    let response = await findUser(options.user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const reqSender = response.data;

    //If the request sender is not a moderator, filter the inactive users
    if (!reqSender.account_type === "moderator") {
      pipeline.push({ $match: { is_active: true } });
    }
    if (pipeline.length == 0) {
      pipeline.push({ $match: {} });
    }

    //execute the query
    const data = await User.aggregate(pipeline).exec();

    //check if the query returned any result
    if (data.length <= 0) {
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
        last_modified: Date.now(),
      });
      const firstSqueal = await newSqueal.save();

      //create the notification and save it
      //quando creiamo uno squeal, mandare la notifica ai destinatari
      const newNotification = new Notification({
        squeal_ref: firstSqueal._id,
        user_id: user._id,
        created_at: Date.now(),
        content: welcomeNotification,
      });
      const notification = await newNotification.save();

      user.squeals.posted.push(firstSqueal._id);
      user.notifications.push(notification._id);

      await user.save();

      // return the new user
      return {
        status: user ? 201 : 400,
        data: user ? user : { error: "Failed to create user" },
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
        throw new Error("Failed to create user");
      }
    }
  },

  /**
   * Get a user object by ID or by username, or user profile
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.user_id Request sender's user id
   * @param options.isTokenValid True if the token is valid, false otherwise
   */
  getUser: async (options) => {
    const { identifier, user_id } = options;
    let response = await findUser(identifier);
    if (response.status >= 300) {
      // If the response is an error, return the error message
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;
    // Create a public user object with limited properties
    const publicUser = {
      _id: user._id,
      username: user.username,
      created_at: user.created_at,
      profile_info: user.profile_info,
      profile_picture: user.profile_picture,
    };

    // Check if the request sender exists
    response = await findUser(user_id);
    if (response.status >= 300) {
      // If the response is an error, return the public user if the main user is active,
      // otherwise return "User not found" error
      return user.is_active ? { status: 200, data: publicUser } : { status: 404, data: { error: "User not found." } };
    }
    const reqSender = response.data;

    // If the main user is inactive and the request sender is not a moderator,
    // return "User not found" error
    if (!user.is_active && reqSender.account_type !== "moderator") {
      return { status: 404, data: { error: "User not found." } };
    }

    // Otherwise, return the full user if the main user is active or the request sender is a moderator,
    // otherwise return "User not found" error
    return { status: 200, data: user.is_active || reqSender.account_type === "moderator" ? user : publicUser };
  },

  /**
   *  Delete a user object by ID or by username
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.user_id Request sender's user id
   */
  deleteUser: async (options) => {
    // Check if the required fields are present

    const { identifier, user_id } = options;

    let response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const userToDelete = response.data;

    // Check if the request sender exists
    response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = response.data;
    if (!reqSender._id.equals(userToDelete._id)) {
      return {
        status: 403,
        data: { error: "You can't delete another user" },
      };
    }

    //----------------------------------------------------------------------------------------------------------------------
    // Removing all the references to the user from the other collections
    userToDelete.Delete();

    return {
      status: 200,
      data: { message: "User deleted successfully" },
    };

    //----------------------------------------------------------------------------------------------------------------------
  },

  /**
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.updateProfileInlineReqJson.profile_info New user's profile info
   * @param options.updateProfileInlineReqJson.profile_picture new user's profile picture
   * @param options.user_id Request sender's user id
   */
  updateProfile: async (options) => {
    const { identifier, user_id } = options;
    const { profile_info, profile_picture } = options.updateProfileInlineReqJson;
    // Check if the required fields are present
    if (!profile_info && !profile_picture) {
      return {
        status: 400,
        data: { error: "No fields to update" },
      };
    }

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = response.data;

    response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const userToUpdate = response.data;

    if (!reqSender._id.equals(userToUpdate._id)) {
      return {
        status: 403,
        data: { error: "You can't update another user" },
      };
    }

    if (profile_info) {
      userToUpdate.profile_info = profile_info;
    }
    if (profile_picture) {
      userToUpdate.profile_picture = profile_picture;
    }
    const updatedUser = userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * @param options.updateProfileInlineReqJson.newPassword New user's password
   * @param options.updateProfileInlineReqJson.oldPassword Old user's password
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.user_id Request sender's user id
   */
  updatePassword: async (options) => {
    const { identifier, user_id } = options;
    const { newPassword, oldPassword } = options?.updateProfileInlineReqJson || {};

    // Check if the required fields are present
    if (!newPassword || !oldPassword) {
      return {
        status: 400,
        data: { error: "Old password and new password are required" },
      };
    }

    //controllare che gli utenti esistano
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = response.data;

    response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const userToUpdate = response.data;

    //check if the request sender is the user to update
    if (!reqSender._id.equals(userToUpdate._id)) {
      return {
        status: 403,
        data: { error: "You can't update another user" },
      };
    }

    //check if the old password is valid
    const isPasswordValid = await bcrypt.compare(oldPassword, userToUpdate.password);
    if (!isPasswordValid) {
      return {
        status: 400,
        data: { error: "Old password is not valid" },
      };
    }

    //replace the old password with the new one
    const salt = await bcrypt.genSalt(securityLvl);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    userToUpdate.password = hashedPassword;

    //save the updated user
    const updatedUser = await userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * Toggle is_active field in user object, means that the user is active or not: if the user is banned, he's not active
   * @param options.identifier User's identifier, can be either username or userId
   */
  toggleProfileActiveStatus: async (options) => {
    //TODO utilizzare select quando abbiamo bisogno di un solo campo e non tutto l'oggetto
    const { identifier, user_id } = options;

    // Check if the required fields are present
    if (!identifier) {
      return {
        status: 400,
        data: { error: "User identifier is required" },
      };
    }

    //controllare che gli utenti esistano
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = response.data;

    //check if the request sender is a moderator
    if (reqSender.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: "You can't update another user" },
      };
    }
    response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const userToUpdate = response.data;

    //toggle the is_active field
    userToUpdate.is_active = !userToUpdate.is_active;

    //save the updated user
    const updatedUser = await userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * @param options.notificationArray Notification's identifier
   */
  toggleNotificationStatus: async (options) => {
    const { user_id } = options;
    const { notificationArray } = options.updateProfileInlineReqJson;

    // Check if the required fields are present
    if (notificationArray === undefined || notificationArray.length <= 0) {
      return {
        status: 400,
        data: { error: "Notification identifier is required" },
      };
    }

    let data = findUser(user_id);
    if (data.status >= 300) {
      //if the response is an error
      return {
        status: data.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = data.data;

    //controllare che gli utenti esistano
    let response = await checkForAllNotifications(notificationArray, reqSender);
    if (!response.notificationsOutcome) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "One or more notifications not found" },
      };
    }

    const updatedNotifications = await Notification.updateMany({ _id: { $in: response.notificationsArray } }, { $set: { is_unseen: false } });
    // Return the result
    return {
      status: 200,
      data: updatedNotifications,
    };
  },
};
