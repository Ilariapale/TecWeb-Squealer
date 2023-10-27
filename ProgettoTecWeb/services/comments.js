const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, CommentSection } = require("./schemas");
const {
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  reactionTypes,
  contentTypes,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findCommentSection,
  findNotification,
  checkForAllUsers,
  checkForAllChannels,
  hasEnoughCharQuota,
  removeQuota,
  addedAndRemoved,
  updateRecipientsUsers,
  updateRecipientsChannels,
  updateRecipientsKeywords,
  containsOfficialChannels,
} = require("./utils");
const { COMMENTS_TO_LOAD } = require("./constants");

const { mentionNotification, squealInOfficialChannel, someoneCommentedYourSqueal } = require("./messages");

module.exports = {
  getCommentSection: async (options) => {
    const { identifier, user_id, last_comment_loaded, is_token_valid } = options;

    let response = await findCommentSection(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const commentSection = response.data;

    if (!is_token_valid) {
      let response = await findSqueal(commentSection.squeal_ref);
      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }
      const squeal = response.data;

      if (!squeal.is_in_official_channel) {
        return {
          status: 403,
          data: { error: `You are not allowed to see this comment section.` },
        };
      }
    }

    if (!last_comment_loaded) {
      commentSection.comments_array = commentSection.comments_array.slice(-COMMENTS_TO_LOAD);
      return {
        status: 200,
        data: commentSection,
      };
    }
    if (!mongooseObjectIdRegex.test(last_comment_loaded)) {
      return {
        status: 400,
        data: { error: `Invalid last_loaded_message.` },
      };
    }

    let targetCommentIndex = commentSection.comments_array.findIndex((comment) => comment._id == last_comment_loaded);

    let from = targetCommentIndex - COMMENTS_TO_LOAD >= 0 ? targetCommentIndex - COMMENTS_TO_LOAD : 0;
    let to = targetCommentIndex >= 0 ? targetCommentIndex : 0;

    commentSection.comments_array = commentSection.comments_array.slice(from, to);

    if (commentSection.comments_array.length == 0) {
      return {
        status: 404,
        data: { error: `No messages found.` },
      };
    }

    return {
      status: 200,
      data: commentSection,
    };
  },

  addComment: async (options) => {
    const { identifier, user_id, message } = options;
    if (!message || message.length <= 0) {
      return {
        status: 400,
        data: { error: `Message cannot be empty.` },
      };
    }

    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    if (!user.is_active) {
      return {
        status: 400,
        data: { error: `You are not allowed to comment squeals while banned.` },
      };
    }

    response = await findCommentSection(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const commentSection = response.data;

    const comment = {
      author_username: user.username,
      author_id: user._id,
      text: message,
      timestamp: Date.now(),
    };

    commentSection.comments_array.push(comment);
    await commentSection.save();
    //Notification
    const notification = new Notification({
      content: someoneCommentedYourSqueal(user.username, message),
      comment_ref: commentSection.comments_array[commentSection.comments_array.length - 1]._id,
      squeal_ref: commentSection.squeal_ref,
      user_ref: (await Squeal.findById(commentSection.squeal_ref).select("user_id").exec()).user_id,
      created_at: Date.now(),
      source: "squeal",
    });
    await notification.save();

    return {
      status: 200,
      data: { comment },
    };
  },

  deleteComment: async (options) => {
    const { identifier, section_identifier, user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const user = response.data;

    response = await findCommentSection(section_identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const commentSection = response.data;

    const comment = commentSection.comments_array.filter((comment) => JSON.stringify(comment._id) === JSON.stringify(identifier))[0];
    //controlli permessi
    const isUserMod = user.account_type === "moderator";
    const isUserSquealOwner = user._id.equals((await Squeal.findById(commentSection.squeal_ref).select("user_id").exec()).user_id);
    const isUserCommentAuthor = user._id.equals(comment.author_id);

    if (!isUserMod && !isUserSquealOwner && !isUserCommentAuthor) {
      return {
        status: 403,
        data: { error: `You are not allowed to delete this comment.` },
      };
    }

    //remove notification
    response = await Notification.findOneAndDelete({ comment_ref: identifier }).exec();

    //remove comment
    commentSection.comments_array = commentSection.comments_array.pull(comment);
    await commentSection.save();

    return {
      status: 200,
      data: { message: `Comment deleted successfully.` },
    };
  },
};
