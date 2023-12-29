const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, CommentSection } = require("./schemas");
const { mongooseObjectIdRegex, findUser, findSqueal, findCommentSection } = require("./utils");
const { COMMENTS_TO_LOAD } = require("./constants");

const { mentionNotification, squealInOfficialChannel, someoneCommentedYourSqueal } = require("./messages");

module.exports = {
  getCommentSection: async (options) => {
    const { identifier, user_id, last_comment_loaded, is_token_valid } = options;

    if (!mongooseObjectIdRegex.test(identifier)) {
      return {
        status: 400,
        data: { error: `Invalid identifier.` },
      };
    }

    let query = { $slice: -COMMENTS_TO_LOAD };
    if (last_comment_loaded && mongooseObjectIdRegex.test(last_comment_loaded)) {
      query = {
        $filter: {
          input: "$comments_array",
          as: "comment",
          cond: {
            $lt: ["$$comment._id", new mongoose.Types.ObjectId(last_comment_loaded)],
          },
        },
      };
    }

    let comment_section = await CommentSection.findOne({ _id: identifier })
      .select({
        _id: 1,
        squeal_ref: 1,
        comments_array: query,
      })
      .exec();

    if (!is_token_valid) {
      let response = await findSqueal(comment_section.squeal_ref);
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

    if (comment_section.comments_array.length > COMMENTS_TO_LOAD) {
      // Use the last COMMENTS_TO_LOAD number of comments
      comment_section.comments_array = comment_section.comments_array.slice(comment_section.comments_array.length - COMMENTS_TO_LOAD);
    }

    return {
      status: 200,
      data: comment_section,
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
      id_code: "newComment",
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
    // Check permissions
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
