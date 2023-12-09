const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, CommentSection } = require("./schemas");
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
  checkIfArrayIsValid,
} = require("./utils");
const {
  welcomeNotification,
  updatedManagedAccountNotification,
  updatedSMMNotification,
  welcomeMessage,
  newManagedAccountNotification,
  newSMMNotification,
  newSMMrequestNotification,
  noLongerSMM,
  noLongerManagedAccount,
  bannedUserNotification,
  unbannedUserNotification,
  declinedSMMrequestNotification,
  updatedProfileTypeNotification,
} = require("./messages");
const { PASSWORD_MIN_LENGTH, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("./constants");
//--------------------------------------------------------------------------
//TODO reportare gli squeal e fare in modo che i moderatori abbiano la possibilità di vedere gli squeal segnalati
module.exports = {
  getUsername: async (options) => {
    const { user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;
    return {
      status: 200,
      data: { username: user.username },
    };
  },

  /**
   * Get users list filtering by creationDate and squeals count
   * @param options.username Filter users by username
   * @param options.created_after Filter users created after the specified date, object with year, month and day properties
   * @param options.created_before Filter users created before the specified date, object with year, month and day properties
   * @param options.max_squeals Filters users with less than the specified number of squeals
   * @param options.min_squeals Filters users with more than the specified number of squeals
   * @param options.account_type Filters users by account type
   * @param options.professional_type Filters users by professional type
   * @param options.sort_order Sorts users, can be either "asc" or "desc"
   * @param options.sort_by Sorts users by the specified field, it can be "username", "date", "squeals"
   * @param options.pag_size Number of users to return
   * @param options.last_loaded Last user loaded, used for pagination
   **/

  getUserList: async (options) => {
    try {
      const { username, last_loaded, created_after, created_before, max_squeals, min_squeals, account_type, professional_type, user_id, sort_order, sort_by } = options;
      let { pag_size } = options;
      const sort_orders = ["asc", "desc"];
      const sort_types = ["username", "date", "squeals"];
      const pipeline = [];

      if (last_loaded) {
        if (!mongooseObjectIdRegex.test(last_loaded)) {
          return {
            status: 400,
            data: { error: `'last_loaded' must be a valid ObjectId.` },
          };
        }
        pipeline.push({ $match: { _id: { $gt: new mongoose.Types.ObjectId(last_loaded) } } });
      }

      //ACCOUNT TYPE
      if (account_type) {
        if (!["standard", "verified", "professional", "moderator"].includes(account_type)) {
          return {
            status: 400,
            data: { error: "'account_type' must be either 'standard', 'verified', 'professional' or 'moderator'." },
          };
        }
        pipeline.push({ $match: { account_type: account_type } });
      }

      //PROFESSIONAL TYPE
      if (professional_type) {
        if (!["VIP", "SMM", "none"].includes(professional_type)) {
          return {
            status: 400,
            data: { error: "'professional_type' must be either 'VIP', 'SMM' or 'none'." },
          };
        }
        pipeline.push({ $match: { professional_type: professional_type } });
      }

      //USERNAME
      if (username) {
        if (!usernameRegex.test(username)) {
          return {
            status: 400,
            data: { error: "'username' format is not valid." },
          };
        }
        pipeline.push({ $match: { username: { $regex: username, $options: "i" } } });
      }

      //CREATED AFTER
      if (created_after) {
        const date = Date.parse(created_after);
        if (isNaN(date)) {
          return {
            status: 400,
            data: { error: "'created_after' must be a valid date: 'YYYY-MM-DD'." },
          };
        }
        pipeline.push({ $match: { created_at: { $gte: new Date(date) } } });
      }

      //CREATED BEFORE
      if (created_before) {
        const date = Date.parse(created_before);
        if (isNaN(date)) {
          return {
            status: 400,
            data: { error: "'created_before' must be a valid date: YYYY-MM-DD." },
          };
        }
        pipeline.push({ $match: { created_at: { $lte: new Date(date) } } });
      }

      //PROJECTION
      pipeline.push({
        $project: {
          _id: 1,
          username: 1,
          profile_info: 1,
          profile_picture: 1,
          created_at: 1,
          professional_type: 1,
          account_type: 1,
          squeals_count: { $size: "$squeals.posted" },
          is_active: 1,
        },
      });

      //MIN AND MAX SQUEALS
      if (max_squeals || min_squeals) {
        const sizeMatch = {};
        if (max_squeals) {
          const int_max_squeals = parseInt(max_squeals);
          if (isNaN(int_max_squeals) || int_max_squeals < 0) {
            //return an error if the max_squeals is negative
            return {
              status: 400,
              data: { error: "'max_squeals' must be a positive integer." },
            };
          }
          sizeMatch.lt = int_max_squeals;
        }
        if (min_squeals) {
          const int_min_squeals = parseInt(min_squeals);
          if (isNaN(int_min_squeals) || int_min_squeals < 0) {
            return {
              //return an error if the min_squeals is negative
              status: 400,
              data: { error: "'min_squeals' must be a positive integer." },
            };
          }
          sizeMatch.gt = int_min_squeals;
        }
        if (sizeMatch.lt != undefined && sizeMatch.gt != undefined && sizeMatch.lt < sizeMatch.gt) {
          //return an error if the max_squeals is less than the min_squeals
          return {
            status: 400,
            data: { error: "'max_squeals' must be greater than min_squeals." },
          };
        }
        pipeline.push({ $match: { squeals_count: { $gte: sizeMatch.gt || 0 } } });
        pipeline.push({ $match: { squeals_count: { $lte: sizeMatch.lt || Number.MAX_SAFE_INTEGER } } });
      }

      //check for the request sender's role
      let response = await findUser(user_id);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const reqSender = response.data;

      //If the request sender is not a moderator, filter the inactive users
      if (reqSender.account_type !== "moderator") {
        pipeline.push({ $match: { is_active: true } });
      }

      //SORTING
      if ((sort_order && !sort_by) || (!sort_order && sort_by)) {
        return {
          status: 400,
          data: { error: "Both 'sort_order' and 'sort_by' must be specified." },
        };
      }

      if (sort_order && sort_by) {
        if (!sort_orders.includes(sort_order) || !sort_types.includes(sort_by)) {
          return {
            status: 400,
            data: { error: `Invalid 'sort_order' or 'sort_by'. 'sort_by' options are '${sort_types.join("', '")}'. 'sort_order' options are '${sort_orders.join("', '")}'.` },
          };
        }

        const order = sort_order === "asc" ? 1 : -1;

        if (sort_by === "username") pipeline.push({ $sort: { username: order } });
        else if (sort_by === "date") pipeline.push({ $sort: { created_at: order } });
        else if (sort_by === "squeals") pipeline.push({ $sort: { squeals_count: order } });
      }

      //PAGE SIZE
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
      console.log(pipeline);
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
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Create a new user
   * @param options.userInput.email Email used at sign up
   * @param options.userInput.password Account password
   * @param options.userInput.username Unique identifier of any given account
   */
  //TESTED
  createUser: async (options) => {
    const { username, email, password } = options.userInput;
    // Check if the required fields are present
    if (!username || !email || !password) {
      return {
        status: 400,
        data: { error: `'username' 'email' and 'password' are required.` },
      };
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return {
        status: 400,
        data: { error: `'password' must be at least 8 characters long.` },
      };
    }

    if (!usernameRegex.test(username)) {
      return {
        status: 400,
        data: { error: `'username' format is not valid.` },
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
          data: { error: `Failed to create user.` },
        };
      }
      // Create the first squeal and save it
      const newSqueal = new Squeal({
        username: user.username,
        hex_id: 0,
        user_id: user._id,
        content_type: "text",
        content: welcomeMessage(user.username),
        created_at: Date.now(),
        last_modified: Date.now(),
      });
      const firstSqueal = await newSqueal.save();

      //create comment section
      const newCommentSection = new CommentSection({
        squeal_ref: firstSqueal._id,
      });
      const commentSection = await newCommentSection.save();

      firstSqueal.comment_section = commentSection._id;
      await firstSqueal.save();

      //create the notification and save it
      //quando creiamo uno squeal, mandare la notifica ai destinatari
      const newNotification = new Notification({
        squeal_ref: firstSqueal._id,
        user_ref: user._id,
        created_at: Date.now(),
        content: welcomeNotification(user.username),
        source: "squeal",
        id_code: "welcomeSqueal",
      });
      const notification = await newNotification.save();

      user.squeals.posted.push(firstSqueal._id);
      user.notifications.push(notification._id);

      await user.save();

      // return the new user
      return {
        status: user ? 201 : 400,
        data: user ? user : { error: `Failed to create user.` },
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
          data: { error: `'username' or 'email' already exists` },
        };
      } else {
        // generic or unknown error
        throw new Error(`Failed to create user`);
      }
    }
  },

  /**
   * Get a user object by ID or by username, or user profile
   * @param options.identifier User's identifier, can be either username or userId
   */
  //TESTED
  getUser: async (options) => {
    const { identifier, user_id, isTokenValid } = options;
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

    const loggedUser = {
      _id: user._id,
      username: user.username,
      account_type: user.account_type,
      professional_type: user.professional_type,
      email: user.email,
      created_at: user.created_at,
      squeals: {
        posted: user.squeals.posted,
      },
      profile_info: user.profile_info,
      profile_picture: user.profile_picture,
      is_active: user.is_active,
    };

    const self = {
      _id: user._id,
      account_type: user.account_type,
      professional_type: user.professional_type,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      squeals: user.squeals,
      char_quota: user.char_quota,
      reaction_metrics: user.reaction_metrics,
      direct_chats: user.direct_chats,
      subscribed_channels: user.subscribed_channels,
      owned_channels: user.owned_channels,
      editor_channels: user.editor_channels,
      profile_info: user.profile_info,
      profile_picture: user.profile_picture,
      smm: user.smm,
      managed_accounts: user.managed_accounts,
      pending_requests: user.pending_requests,
      preferences: user.preferences,
      notifications: user.notifications,
      is_active: user.is_active,
    };

    // Check if the request sender exists
    if (!isTokenValid) {
      return user.is_active ? { status: 200, data: publicUser } : { status: 404, data: { error: `User not found.` } };
    }
    response = await findUser(user_id);
    if (response.status >= 300) {
      // If the response is an error, return the public user if the main user is active,
      // otherwise return "User not found" error
      return user.is_active ? { status: 200, data: publicUser } : { status: 404, data: { error: `User not found.` } };
    }
    const reqSender = response.data;

    // If the main user is inactive and the request sender is not a moderator,
    // return "User not found" error
    if (user._id !== reqSender._id) {
      if (!user.is_active && reqSender.account_type !== "moderator") {
        return { status: 404, data: { error: `User not found.` } };
      } else if (reqSender.account_type === "moderator") {
        return { status: 200, data: self };
      } else {
        return { status: 200, data: loggedUser };
      }
    } else {
      return { status: 200, data: self };
    }

    // Otherwise, return the full user if the main user is active or the request sender is a moderator,
    // otherwise return "User not found" error
    //return { status: 200, data: user.is_active || reqSender.account_type === "moderator" ? user : publicUser };
  },

  /**
   *  Delete a user object by ID or by username
   * @param options.identifier User's identifier, can be either username or userId
   */
  //TESTED
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
        data: { error: `'user_id' in token is not valid.` },
      };
    }
    const reqSender = response.data;
    if (!reqSender._id.equals(userToDelete._id)) {
      return {
        status: 403,
        data: { error: `You are not allowed to delete another user.` },
      };
    }

    //----------------------------------------------------------------------------------------------------------------------
    // Removing all the references to the user from the other collections
    userToDelete.Delete();

    return {
      status: 200,
      data: { message: "User deleted successfully." },
    };

    //----------------------------------------------------------------------------------------------------------------------
  },

  /**
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.inlineReqJson.account_type New user's account type
   * @param options.inlineReqJson.professional_type New user's professional type
   */
  //TYPE TESTED
  updateUser: async (options) => {
    const { identifier, user_id } = options;
    const { account_type, professional_type } = options.inlineReqJson;
    // Check if the required fields are present
    if (!account_type && !professional_type) {
      return {
        status: 400,
        data: { error: `No fields to update.` },
      };
    }
    if (account_type && !["standard", "verified", "professional", "moderator"].includes(account_type)) {
      return {
        status: 400,
        data: { error: `'account_type' must be either 'standard', 'verified', 'professional' or 'moderator'.` },
      };
    }
    if (professional_type && !["VIP", "SMM", "none"].includes(professional_type)) {
      return {
        status: 400,
        data: { error: `'professional_type' must be either 'VIP', 'SMM' or 'none'.` },
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
    const reqSender = response.data;

    //if reqSender is not a moderator, he can't update the account type
    if (reqSender.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You are not allowed to update the user.` },
      };
    }

    //controlli di coerenza
    if (account_type === "professional" && (!professional_type || professional_type === "none")) {
      return {
        status: 400,
        data: { error: "'professional_type' must be specified." },
      };
    }

    if (["VIP", "SMM"].includes(professional_type) && account_type !== "professional") {
      return {
        status: 400,
        data: { error: "'account_type' must be 'professional'." },
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

    const old_account_type = userToUpdate.account_type;
    const old_professional_type = userToUpdate.professional_type;

    //se era professional vip
    if (userToUpdate.account_type === "professional" && userToUpdate.professional_type === "VIP" && professional_type !== "VIP") {
      //se aveva un SMM rimuovere il smm dal profilo e il profilo dal smm
      if (userToUpdate.smm) {
        response = await findUser(userToUpdate.smm);
        if (response.status >= 300) {
          //if the response is an error
          return {
            status: response.status,
            data: { error: `SMM not found.` },
          };
        }
        const smm = response.data;
        smm.managed_accounts.pull(userToUpdate._id);
        userToUpdate.smm = undefined;
        const newNotification = new Notification({
          user_ref: smm._id,
          created_at: Date.now(),
          content: updatedManagedAccountNotification(userToUpdate.username),
          source: "system",
          id_code: "noMoreVipSMM",
        });
        const notification = await newNotification.save();
        smm.notifications.push(notification._id);
        await smm.save();
      }
      //gestire la coda di richieste del VIP
      //rimuovo dall'array tutte le richieste e rimuovo dai vip la richiesta in coda
      const VIPRequestsPromises = userToUpdate.pending_requests.VIP_requests.map(async (request) => {
        const response = await findUser(request);
        if (response.status >= 300) {
          //if the response is an error
          return {
            status: response.status,
            data: { error: `User not found.` },
          };
        }
        const SMM = response.data;
        SMM.pending_requests.SMM_requests.pull(userToUpdate._id);
        return SMM.save();
      });
      await Promise.all(VIPRequestsPromises);
      userToUpdate.pending_requests.VIP_requests = [];
    }
    //se era professional smm, rimuovere tutti i managed_accounts dal profilo e il smm da tutti i managed_accounts
    if (userToUpdate.account_type === "professional" && userToUpdate.professional_type === "SMM" && professional_type !== "SMM") {
      if (userToUpdate.managed_accounts.length > 0) {
        const managedAccountsPromises = userToUpdate.managed_accounts.map(async (managed_account) => {
          const response = await findUser(managed_account);
          if (response.status >= 300) {
            //if the response is an error
            return {
              status: response.status,
              data: { error: `Managed account not found.` },
            };
          }
          const managedAccount = response.data;
          managedAccount.smm = undefined;
          const newNotification = new Notification({
            squeal_ref: undefined,
            user_ref: managedAccount._id,
            created_at: Date.now(),
            content: updatedSMMNotification(userToUpdate.username),
            source: "system",
            id_code: "noMoreSmmVIP",
          });
          const notification = await newNotification.save();
          managedAccount.notifications.push(notification._id);
          return managedAccount.save();
        });
        await Promise.all(managedAccountsPromises);
        userToUpdate.managed_accounts = [];
      }

      const SMMRequestsPromises = userToUpdate.pending_requests.SMM_requests.map(async (request) => {
        const response = await findUser(request);
        if (response.status >= 300) {
          //if the response is an error
          return {
            status: response.status,
            data: { error: `User not found.` },
          };
        }
        const VIP = response.data;
        VIP.pending_requests.VIP_requests.pull(userToUpdate._id);
        return VIP.save();
      });
      await Promise.all(SMMRequestsPromises);
      userToUpdate.pending_requests.SMM_requests = [];
    }

    userToUpdate.account_type = account_type || userToUpdate.account_type;
    userToUpdate.professional_type = professional_type || (account_type === "professional" ? professional_type : "none");

    if (!(userToUpdate.account_type === old_account_type && userToUpdate.professional_type === old_professional_type)) {
      const newNotification = new Notification({
        user_ref: userToUpdate._id,
        created_at: Date.now(),
        content: updatedProfileTypeNotification(userToUpdate.username, old_account_type, userToUpdate.account_type, old_professional_type, userToUpdate.professional_type),
        source: "system",
        id_code: "accountUpdate",
      });
      const notification = await newNotification.save();
      userToUpdate.notifications.push(notification._id);
    }
    const updatedUser = await userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * This function is used by a VIP to send a request to a SMM
   * @param options.identifier SMM's identifier, can be either username or userId
   * @param option.action Action to perform, can be either "send" or "withdraw"
   */
  //TESTED
  requestSMM: async (options) => {
    const { identifier, user_id, action } = options;

    if (!action || !identifier || action === "" || identifier === "") {
      return {
        status: 400,
        data: { error: `Both 'SMM_id' and 'action' must be specified.` },
      };
    }

    if (!["send", "withdraw"].includes(action)) {
      return {
        status: 400,
        data: { error: `Invalid value for 'action' field. 'action' options are 'send' or 'withdraw'` },
      };
    }

    //check if the request sender exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid` },
      };
    }
    const reqSender = response.data;

    //check if the reqSender is a VIP
    if (reqSender.account_type !== "professional" || reqSender.professional_type !== "VIP") {
      return {
        status: 403,
        data: { error: `You are not a VIP and you're not allowed to have a SMM.` },
      };
    }

    if (reqSender.is_active === false) {
      return {
        status: 403,
        data: { error: `You are not allowed to send/withdraw SMM requests because you are banned` },
      };
    }

    //check if the reqSender already has a SMM
    if (reqSender.smm && action === "send") {
      return {
        status: 400,
        data: { error: `You already have a SMM` },
      };
    }

    //check if the requested SMM exists
    response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const smm = response.data;

    //check if the requested SMM is a proper SMM
    if (smm.account_type !== "professional" || smm.professional_type !== "SMM") {
      return {
        status: 400,
        data: { error: `The user is not a SMM.` },
      };
    }

    if (!smm.is_active) {
      return {
        status: 400,
        data: { error: `You cannot request a banned user to be your SMM.` },
      };
    }

    if (smm.pending_requests.SMM_requests.includes(reqSender._id)) {
      if (action === "send") {
        //includes funziona con gli id
        return {
          status: 400,
          data: { error: `You already sent a request to this SMM.` },
        };
      }
      //withdraw
      smm.pending_requests.SMM_requests.pull(reqSender._id);
      reqSender.pending_requests.VIP_requests.pull(smm._id);
      const oldNotification = await Notification.deleteOne({ user_ref: smm._id, content: newSMMrequestNotification(reqSender.username) });
      reqSender.notifications.pull(oldNotification._id);
      await smm.save();
      await reqSender.save();
      return {
        status: 200,
        data: { message: `Request withdrawn successfully` },
      };
    }
    if (action === "withdraw") {
      return {
        status: 400,
        data: { error: `You didn't send a request to this SMM.` },
      };
    }
    //send notification to the SMM
    const newNotification = new Notification({
      user_ref: smm._id,
      created_at: Date.now(),
      content: newSMMrequestNotification(reqSender.username),
      source: "user",
      reply: true,
      id_code: "SMMrequest",
      sender_ref: reqSender._id,
    });
    await newNotification.save();

    smm.notifications.push(newNotification._id);
    smm.pending_requests.SMM_requests.push(reqSender._id);
    reqSender.pending_requests.VIP_requests.push(smm._id);

    await smm.save();
    await reqSender.save();

    return {
      status: 200,
      data: { message: `Request sent successfully.` },
    };
  },

  /**
   * This function is used by a SMM to accept or decline a VIP's request
   * @param options.identifier New user's VIP
   * @param options.request_action Response to the request, can be either "accept" or "decline"
   */
  //TESTED
  handleVIPRequest: async (options) => {
    const { identifier, user_id, request_action } = options;

    if (!request_action || !identifier || request_action === "" || identifier === "") {
      return {
        status: 400,
        data: { error: `Both 'VIP_id' and 'action' must be specified.` },
      };
    }

    if (!["accept", "decline"].includes(request_action)) {
      return {
        status: 400,
        data: { error: `'request_action' must be either 'accept' or 'decline'.` },
      };
    }

    //check if the request sender exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid.` },
      };
    }
    const reqSender = response.data;

    //check if the reqSender is a SMM
    if (reqSender.account_type !== "professional" || reqSender.professional_type !== "SMM") {
      return {
        status: 403,
        data: { error: `You are not a SMM.` },
      };
    }

    //check if the SMM is banned
    if (reqSender.is_active === false) {
      return {
        status: 403,
        data: { error: `Banned users are not allowed to handle requests.` },
      };
    }

    //check if the requested VIP exists
    response = await findUser(identifier);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const vip = response.data;

    //check if the requested VIP is a proper VIP
    if (vip.account_type !== "professional" || vip.professional_type !== "VIP") {
      return {
        status: 400,
        data: { error: `The user is not a VIP.` },
      };
    }

    //check if the VIP already has a SMM
    if (vip.smm) {
      vip.pending_requests.VIP_requests.pull(reqSender._id);
      reqSender.pending_requests.SMM_requests.pull(vip._id);
      return {
        status: 400,
        data: { error: `The VIP already has a SMM.` },
      };
    }
    //SMM accepts the request
    if (request_action === "accept") {
      //add the VIP to the SMM's managed_accounts
      reqSender.managed_accounts.push(vip._id);
      //set the SMM of the VIP
      vip.smm = reqSender._id;

      //VIP NOTIFICATION
      const newVipNotification = new Notification({
        user_ref: vip._id,
        created_at: Date.now(),
        content: newSMMNotification(reqSender.username),
        source: "user",
        id_code: "SMMaccepted",
        sender_ref: reqSender._id,
      });
      const vipNotification = await newVipNotification.save();
      vip.notifications.push(vipNotification._id);

      //SMM NOTIFICATION
      const newSmmNotification = new Notification({
        user_ref: reqSender._id,
        created_at: Date.now(),
        content: newManagedAccountNotification(vip.username),
        source: "user",
        id_code: "SMMaccepted",
        sender_ref: vip._id,
      });
      const smmNotification = await newSmmNotification.save();
      reqSender.notifications.push(smmNotification._id);
    } else {
      //SMM declines the request
      const newNotification = new Notification({
        user_ref: vip._id,
        created_at: Date.now(),
        content: declinedSMMrequestNotification(reqSender.username),
        source: "user",
        id_code: "SMMdeclined",
        sender_ref: reqSender._id,
      });
      await newNotification.save();
      vip.notifications.push(newNotification._id);
    }
    //remove request from both profiles
    vip.pending_requests.VIP_requests.pull(reqSender._id);
    reqSender.pending_requests.SMM_requests.pull(vip._id);

    const oldNotification = await Notification.deleteOne({ user_ref: reqSender._id, content: newSMMrequestNotification(vip.username) });
    vip.notifications.pull(oldNotification._id);

    await vip.save();
    await reqSender.save();

    return {
      status: 200,
      data: { message: `Request handled successfully` },
    };
  },

  /**
   * This function is used to remove the SMM
   */
  removeSMM: async (options) => {
    const { user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: response.error,
      };
    }
    const user = response.data;
    //check if the user is a VIP
    if (user.account_type !== "professional" || user.professional_type !== "VIP") {
      return {
        status: 403,
        data: { error: `You are not a VIP.` },
      };
    }
    //check if the user has a SMM
    if (!user.smm) {
      return {
        status: 400,
        data: { error: `You don't have a SMM.` },
      };
    }

    const notification = new Notification({
      user_ref: user.smm,
      created_at: Date.now(),
      content: noLongerSMM(user.username),
      source: "user",
      id_code: "noMoreVipSMM",
      sender_ref: user._id,
    });
    await notification.save();

    await User.findbyIdAndUpdate(user.smm, { $pull: { managed_accounts: user._id }, $push: { notifications: notification._id } });

    user.smm = undefined;
    await user.save();

    return {
      status: 200,
      data: { message: "SMM removed successfully." },
    };
  },

  /**
   * This function is used to remove the SMM
   * @param options.identifier Identifier of the VIP to remove
   */
  //TODO testare
  removeVIP: async (options) => {
    const { identifier, user_id } = options;

    if (!identifier || identifier === "" || !mongooseObjectIdRegex.test(identifier)) {
      return {
        status: 400,
        data: { error: `Missing or invalid value for 'identifier' field.` },
      };
    }

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: response.error,
      };
    }
    const user = response.data;
    //check if the user is a SMM
    if (user.account_type !== "professional" || user.professional_type !== "SMM") {
      return {
        status: 403,
        data: { error: `You are not a SMM.` },
      };
    }

    //check if the user has a VIP
    if (!user.managed_accounts.includes(identifier)) {
      return {
        status: 400,
        data: { error: `You are not their SMM.` },
      };
    }

    const notification = new Notification({
      user_ref: identifier,
      created_at: Date.now(),
      content: noLongerManagedAccount(user.username),
      source: "user",
      id_code: "noMoreSmmVIP",
      sender_ref: user._id,
    });
    await notification.save();

    await User.findbyIdAndUpdate(identifier, { $set: { smm: undefined }, $push: { notifications: notification._id } });

    user.managed_accounts.pull(identifier);
    await user.save();

    return {
      status: 200,
      data: { message: `VIP removed successfully.` },
    };
  },

  /**
   * @param options.identifier User's identifier, can be either username or userId
   * @param options.inlineReqJson.profile_info New user's profile info
   * @param options.inlineReqJson.profile_picture new user's profile picture
   */
  updateProfile: async (options) => {
    //TODO immagine profilo, in generale caricamento immagini
    const { identifier, user_id } = options;
    const { profile_info, profile_picture } = options.inlineReqJson;
    // Check if the required fields are present
    if (!profile_info && !profile_picture) {
      return {
        status: 400,
        data: { error: `No fields to update.` },
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
        data: { error: `You are not allowed to update another user.` },
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
   * @param options.inlineReqJson.new_password New user's password
   * @param options.inlineReqJson.old_password Old user's password
   * @param options.identifier User's identifier, can be either username or userId
   */
  updatePassword: async (options) => {
    const { identifier, user_id } = options;
    const { new_password, old_password } = options?.inlineReqJson || {};

    // Check if the required fields are present
    if (!new_password || !old_password) {
      return {
        status: 400,
        data: { error: `'old_password' and 'new_password' are required.` },
      };
    }

    if (new_password.length < PASSWORD_MIN_LENGTH) {
      return {
        status: 400,
        data: { error: `'new_password' must be at least 8 characters long.` },
      };
    }

    //controllare che gli utenti esistano
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid.` },
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
        data: { error: `You are not allowed to update another user.` },
      };
    }

    //check if the old password is valid
    const isPasswordValid = await bcrypt.compare(old_password, userToUpdate.password);
    if (!isPasswordValid) {
      return {
        status: 400,
        data: { error: `'old_password' is not valid.` },
      };
    }

    //replace the old password with the new one
    const salt = await bcrypt.genSalt(securityLvl);
    const hashedPassword = await bcrypt.hash(new_password, salt);
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
   * @param options.ban_status New user's ban status, "true" if banned, "false" if not
   */
  userBanStatus: async (options) => {
    //Se ha un smm anche il smm riceve la notifica.
    //Se è un smm, tutti i vip che lo hanno come smm ricevono la notifica

    const { identifier, user_id, ban_status } = options;

    //check if ban_status is valid
    if (!["true", "false"].includes(ban_status)) {
      return {
        status: 400,
        data: { error: `Ban status value must be either 'true' or 'false'.` },
      };
    }

    // Check if the required fields are present
    if (!identifier) {
      return {
        status: 400,
        data: { error: `User 'identifier' is required.` },
      };
    }

    //controllare che gli utenti esistano
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid.` },
      };
    }
    const reqSender = response.data;

    //check if the request sender is a moderator
    if (reqSender.account_type !== "moderator") {
      return {
        status: 403,
        data: { error: `You are not allowed to ban a user.` },
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

    //change the "is_active" field: if the user is banned, he's not active
    userToUpdate.is_active = ban_status === "true" ? false : true;

    const notification = new Notification({
      user_ref: userToUpdate._id,
      created_at: Date.now(),
      content: ban_status === "true" ? bannedUserNotification(userToUpdate.username) : unbannedUserNotification(userToUpdate.username),
      source: "system",
      id_code: "banStatusUpdate",
    });
    await notification.save();

    //save the updated user
    const updatedUser = await userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * @param options.inlineReqJson.notification_array Notifications identifier array
   * @param options.value New notification status
   */
  setNotificationStatus: async (options) => {
    try {
      const { user_id, value } = options;
      const { notification_array } = options.inlineReqJson;

      const new_is_unseen = value === "true" ? true : value[0] == "true" ? true : false;

      let data = checkIfArrayIsValid(notification_array);
      if (!data.isValid) {
        return {
          status: 400,
          data: { error: `Notification 'identifiers' are not valid.` },
        };
      }
      const array = data.value;

      // Check if the required fields are present
      if (array === undefined || array.length <= 0) {
        return {
          status: 400,
          data: { error: `Notification 'identifier' is required.` },
        };
      }

      // Check if the array contains only valid ids
      for (let i = 0; i < array.length; i++) {
        let notificationId = array[i];
        if (!mongooseObjectIdRegex.test(notificationId)) {
          return {
            status: 400,
            data: { error: `Notification 'identifier' ${i} is not valid.` },
          };
        }
      }

      let response = await findUser(user_id);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: `'user_id' in token is not valid.` },
        };
      }
      const reqSender = response.data;
      //controllare che gli utenti esistano
      response = await checkForAllNotifications(array, reqSender);
      if (!response.notificationsOutcome) {
        //if the response is an error
        return {
          status: 404,
          data: { error: `One or more notifications not found.` },
        };
      }

      await Notification.updateMany({ _id: { $in: response.notificationsArray } }, { $set: { is_unseen: new_is_unseen } });
      // Return the result
      return {
        status: 200,
        data: { message: "Notifications updated successfully." },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        data: { error: `Internal server error.` },
      };
    }
  },

  /**
   * @param options.identifiers
   */
  getNotifications: async (options) => {
    const { user_id } = options;

    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `'user_id' in token is not valid.` },
      };
    }
    const reqSender = response.data;
    const notificatins = await Notification.find({ _id: { $in: reqSender.notifications } });
    return {
      status: 200,
      data: notificatins,
    };
  },
};
