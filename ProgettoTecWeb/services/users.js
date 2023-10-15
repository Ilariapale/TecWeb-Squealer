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
} = require("./messages");
const { PASSWORD_MIN_LENGTH } = require("./constants");
//--------------------------------------------------------------------------
//TODO messaggi privati
//TODO commenti agli squeals

module.exports = {
  /**
   * Get users list filtering by creationDate and squeals count
   * @param options.created_after Filter users created after the specified date, object with year, month and day properties
   * @param options.created_before Filter users created before the specified date, object with year, month and day properties
   * @param options.max_squeals Filters users with less than the specified number of squeals
   * @param options.min_squeals Filters users with more than the specified number of squeals
   * @param options.account_type Filters users by account type
   * @param options.professional_type Filters users by professional type
   *
   * @param options.sort_order Sorts users, can be either "asc" or "desc"
   * @param options.sort_by Sorts users by the specified field, it can be "username", "date", "squeals"
   **/
  //TESTED
  getUserList: async (options) => {
    try {
      const { created_after, created_before, max_squeals, min_squeals, account_type, professional_type, user_id, sort_order, sort_by } = options;
      const sort_orders = ["asc", "desc"];
      const sort_types = ["username", "date", "squeals"];
      const pipeline = [];

      //ACCOUNT TYPE
      if (account_type) {
        if (!["standard", "verified", "professional", "moderator"].includes(account_type)) {
          return {
            status: 400,
            data: { error: "account_type must be either 'standard', 'verified', 'professional' or 'moderator'" },
          };
        }
        pipeline.push({ $match: { account_type: account_type } });
      }

      //PROFESSIONAL TYPE
      if (professional_type) {
        if (!["VIP", "SMM", "none"].includes(professional_type)) {
          return {
            status: 400,
            data: { error: "professional_type must be either 'VIP', 'SMM' or 'none'" },
          };
        }
        pipeline.push({ $match: { professional_type: professional_type } });
      }

      //CREATED AFTER
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

      //CREATED BEFORE
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
              data: { error: "max_squeals must be a positive integer" },
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
              data: { error: "min_squeals must be a positive integer" },
            };
          }
          sizeMatch.gt = int_min_squeals;
        }
        if (sizeMatch.lt != undefined && sizeMatch.gt != undefined && sizeMatch.lt < sizeMatch.gt) {
          //return an error if the max_squeals is less than the min_squeals
          return {
            status: 400,
            data: { error: "max_squeals must be greater than min_squeals" },
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
          data: { error: "Both sort_order and sort_by must be specified" },
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
      console.error(err);
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
        data: { error: "Username email and password are required" },
      };
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return {
        status: 400,
        data: { error: "Password must be at least 8 characters long" },
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
        content: welcomeMessage(user.username),
        created_at: Date.now(),
        last_modified: Date.now(),
      });
      const firstSqueal = await newSqueal.save();

      //create the notification and save it
      //quando creiamo uno squeal, mandare la notifica ai destinatari
      const newNotification = new Notification({
        squeal_ref: firstSqueal._id,
        user_ref: user._id,
        created_at: Date.now(),
        content: welcomeNotification(user.username),
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
   */
  //TESTED
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
   * @param options.inlineReqJson.account_type New user's account type
   * @param options.inlineReqJson.professional_type New user's professional type
   */
  //TYPE TESTED
  updateUser: async (options) => {
    try {
      const { identifier, user_id } = options;
      const { account_type, professional_type } = options.inlineReqJson;
      // Check if the required fields are present
      if (!account_type && !professional_type) {
        return {
          status: 400,
          data: { error: "No fields to update" },
        };
      }
      if (account_type && !["standard", "verified", "professional", "moderator"].includes(account_type)) {
        return {
          status: 400,
          data: { error: "account_type must be either 'standard', 'verified', 'professional' or 'moderator'" },
        };
      }
      if (professional_type && !["VIP", "SMM", "none"].includes(professional_type)) {
        return {
          status: 400,
          data: { error: "professional_type must be either 'VIP', 'SMM' or 'none'" },
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

      //if reqSender is not a moderator, he can't update the account type
      if (reqSender.account_type !== "moderator") {
        return {
          status: 403,
          data: { error: "You are not allowed to update the user" },
        };
      }

      //controlli di coerenza
      if (account_type === "professional" && (!professional_type || professional_type === "none")) {
        return {
          status: 400,
          data: { error: "Professional type must be specified" },
        };
      }

      if (["VIP", "SMM"].includes(professional_type) && account_type !== "professional") {
        return {
          status: 400,
          data: { error: "account_type must be 'professional'." },
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

      //TODO controllare
      //se era professional vip
      if (userToUpdate.account_type === "professional" && userToUpdate.professional_type === "VIP" && professional_type !== "VIP") {
        //se aveva un SMM rimuovere il smm dal profilo e il profilo dal smm
        if (userToUpdate.smm) {
          response = await findUser(userToUpdate.smm);
          if (response.status >= 300) {
            //if the response is an error
            return {
              status: response.status,
              data: { error: "Smm not found" },
            };
          }
          const smm = response.data;
          smm.managed_accounts.pull(userToUpdate._id);
          userToUpdate.smm = undefined;

          const newNotification = new Notification({
            squeal_ref: undefined,
            user_ref: smm._id,
            created_at: Date.now(),
            content: updatedManagedAccountNotification(userToUpdate.username),
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
              data: { error: "User not found" },
            };
          }
          const SMM = response.data;
          SMM.pending_requests.SMM_requests.pull(userToUpdate._id);
          return SMM.save();
        });
        await Promise.all(VIPRequestsPromises);
        userToUpdate.pending_requests.VIP_requests = [];
      }
      //TODO controllare
      //se era professional smm, rimuovere tutti i managed_accounts dal profilo e il smm da tutti i managed_accounts
      if (userToUpdate.account_type === "professional" && userToUpdate.professional_type === "SMM" && professional_type !== "SMM") {
        if (userToUpdate.managed_accounts.length > 0) {
          const managedAccountsPromises = userToUpdate.managed_accounts.map(async (managed_account) => {
            const response = await findUser(managed_account);
            if (response.status >= 300) {
              //if the response is an error
              return {
                status: response.status,
                data: { error: "Managed account not found" },
              };
            }
            const managedAccount = response.data;
            managedAccount.smm = undefined;

            const newNotification = new Notification({
              squeal_ref: undefined,
              user_ref: managedAccount._id,
              created_at: Date.now(),
              content: updatedSMMNotification(userToUpdate.username),
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
              data: { error: "User not found" },
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

      const updatedUser = await userToUpdate.save();

      // Return the result
      return {
        status: 200,
        data: updatedUser,
      };
    } catch (err) {
      console.error(err);
    }
  },

  /**
   * This function is used by a VIP to send a request to a SMM
   * @param options.identifier SMM's identifier, can be either username or userId
   */
  requestSMM: async (options) => {
    try {
      const { identifier, user_id } = options;

      //check if the request sender exists
      let response = await findUser(user_id);
      if (response.status >= 300) {
        //if the response is an error
        return {
          status: response.status,
          data: { error: `User id in token is not valid` },
        };
      }
      const reqSender = response.data;

      //check if the reqSender is a VIP
      if (reqSender.account_type !== "professional" || reqSender.professional_type !== "VIP") {
        return {
          status: 403,
          data: { error: `You are not allowed to have a SMM` },
        };
      }

      if (reqSender.is_active === false) {
        return {
          status: 403,
          data: { error: `You are not allowed to request a SMM because you are banned` },
        };
      }

      //check if the reqSender already has a SMM
      if (reqSender.smm) {
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
          data: { error: "The user is not a SMM" },
        };
      }

      if (smm.is_active === false) {
        return {
          status: 400,
          data: { error: `You cannot request a banned user to be your SMM.` },
        };
      }

      if (smm.pending_requests.SMM_requests.includes(reqSender._id)) {
        //TODO controllare se ll'include funziona con gli id
        return {
          status: 400,
          data: { error: `You already sent a request to this SMM` },
        };
      }

      //send notification to the SMM
      const newNotification = new Notification({
        squeal_ref: undefined,
        user_ref: smm._id,
        created_at: Date.now(),
        content: newSMMrequestNotification(reqSender.username),
        reply: true,
      });
      await newNotification.save();

      smm.notifications.push(newNotification._id);
      smm.pending_requests.SMM_requests.push(reqSender._id);
      reqSender.pending_requests.VIP_requests.push(smm._id);

      await smm.save();
      await reqSender.save();

      return {
        status: 200,
        data: { message: `Request sent successfully` },
      };
    } catch (err) {
      console.error(err);
    }
  },

  /**
   * This function is used by a SMM to accept or decline a VIP's request
   * @param options.identifier New user's VIP
   * @param options.request_response Response to the request, can be either "true" or "false"
   */
  //TESTED
  handleVIPRequest: async (options) => {
    const { identifier, user_id, request_response } = options;

    if (!["true", "false"].includes(request_response)) {
      return {
        status: 400,
        data: { error: `Request response must be either 'true' or 'false'` },
      };
    }

    //check if the request sender exists
    let response = await findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: `User id in token is not valid` },
      };
    }
    const reqSender = response.data;

    //check if the reqSender is a SMM
    if (reqSender.account_type !== "professional" || reqSender.professional_type !== "SMM") {
      return {
        status: 403,
        data: { error: `You are not a SMM` },
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
        data: { error: "The user is not a VIP" },
      };
    }

    //check if the VIP already has a SMM
    if (vip.smm) {
      vip.pending_requests.VIP_requests.pull(reqSender._id);
      reqSender.pending_requests.SMM_requests.pull(vip._id);
      return {
        status: 400,
        data: { error: "The VIP already has a SMM" },
      };
    }
    //SMM accepts the request
    if (request_response === "true") {
      //add the VIP to the SMM's managed_accounts
      reqSender.managed_accounts.push(vip._id);
      //set the SMM of the VIP
      vip.smm = reqSender._id;

      //VIP NOTIFICATION
      const newVipNotification = new Notification({
        squeal_ref: undefined,
        user_ref: vip._id,
        created_at: Date.now(),
        content: newSMMNotification(reqSender.username),
      });
      const vipNotification = await newVipNotification.save();
      vip.notifications.push(vipNotification._id);

      //SMM NOTIFICATION
      const newSmmNotification = new Notification({
        squeal_ref: undefined,
        user_ref: reqSender._id,
        created_at: Date.now(),
        content: newManagedAccountNotification(vip.username),
      });
      const smmNotification = await newSmmNotification.save();
      reqSender.notifications.push(smmNotification._id);
    }
    //remove request from both profiles
    vip.pending_requests.VIP_requests.pull(reqSender._id);
    reqSender.pending_requests.SMM_requests.pull(vip._id);
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
        data: { error: "You are not a VIP" },
      };
    }
    //check if the user has a SMM
    if (!user.smm) {
      return {
        status: 400,
        data: { error: "You don't have a SMM" },
      };
    }

    const notification = new Notification({
      squeal_ref: undefined,
      user_ref: user.smm,
      created_at: Date.now(),
      content: noLongerSMM(user.username),
    });
    await notification.save();

    await User.findbyIdAndUpdate(user.smm, { $pull: { managed_accounts: user._id }, $push: { notifications: notification._id } });

    user.smm = undefined;
    await user.save();

    return {
      status: 200,
      data: { message: "SMM removed successfully" },
    };
  },

  /**
   * This function is used to remove the SMM
   * @param options.identifier Identifier of the VIP to remove
   */
  removeVIP: async (options) => {
    const { identifier, user_id } = options;
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
        data: { error: "You are not a SMM" },
      };
    }
    //check if the user has a VIP
    if (!user.managed_accounts.includes(identifier)) {
      return {
        status: 400,
        data: { error: "You're not their SMM" },
      };
    }

    const notification = new Notification({
      squeal_ref: undefined,
      user_ref: identifier,
      created_at: Date.now(),
      content: noLongerManagedAccount(user.username),
    });
    await notification.save();

    await User.findbyIdAndUpdate(identifier, { $set: { smm: undefined }, $push: { notifications: notification._id } });

    user.managed_accounts.pull(identifier);
    await user.save();

    return {
      status: 200,
      data: { message: "VIP removed successfully" },
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
   * @param options.inlineReqJson.newPassword New user's password
   * @param options.inlineReqJson.oldPassword Old user's password
   * @param options.identifier User's identifier, can be either username or userId
   */
  updatePassword: async (options) => {
    const { identifier, user_id } = options;
    const { newPassword, oldPassword } = options?.inlineReqJson || {};

    // Check if the required fields are present
    if (!newPassword || !oldPassword) {
      return {
        status: 400,
        data: { error: "Old password and new password are required" },
      };
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return {
        status: 400,
        data: { error: "New password must be at least 8 characters long" },
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
   * @param options.ban_status New user's ban status, "true" if banned, "false" if not
   */
  userBanStatus: async (options) => {
    //TODO utilizzare select quando abbiamo bisogno di un solo campo e non tutto l'oggetto
    //TODO quando un utente viene bannato, riceve una notifica.
    //Se ha un smm anche il smm riceve la notifica.
    //Se è un smm, tutti i vip che lo hanno come smm ricevono la notifica

    const { identifier, user_id, ban_status } = options;

    //check if ban_status is valid
    if (!["true", "false"].includes(ban_status)) {
      return {
        status: 400,
        data: { error: "Ban status value must be either 'true' or 'false'" },
      };
    }

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
        data: { error: "Only a moderator can ban another user" },
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
    userToUpdate.is_active = ban_status === "true" ? false : true;

    //save the updated user
    const updatedUser = await userToUpdate.save();

    // Return the result
    return {
      status: 200,
      data: updatedUser,
    };
  },

  /**
   * @param options.notificationArray Notifications identifier array
   */
  toggleNotificationStatus: async (options) => {
    //TODO modifica il toggle
    const { user_id } = options;
    const { notificationArray } = options.inlineReqJson;

    // Check if the required fields are present
    if (notificationArray === undefined || notificationArray.length <= 0) {
      return {
        status: 400,
        data: { error: "Notification identifier is required" },
      };
    }

    // Check if the array contains only valid ids
    for (let i = 0; i < notificationArray.length; i++) {
      let notificationId = notificationArray[i];
      if (mongooseObjectIdRegex.test(notificationId) === false) {
        return {
          status: 400,
          data: { error: `Notification identifier ${i} is not valid` },
        };
      }
    }

    let response = findUser(user_id);
    if (response.status >= 300) {
      //if the response is an error
      return {
        status: response.status,
        data: { error: "User id in token is not valid" },
      };
    }
    const reqSender = response.data;

    //controllare che gli utenti esistano
    response = await checkForAllNotifications(notificationArray, reqSender);
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
