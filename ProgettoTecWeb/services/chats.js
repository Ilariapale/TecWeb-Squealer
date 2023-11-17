const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, Chat } = require("./schemas");
const { findUser, findChat, mongooseObjectIdRegex } = require("./utils");
const { DIRECT_MESSAGE_MAX_LENGTH, MESSAGES_TO_LOAD } = require("./constants");

module.exports = {
  getAllChatsPreview: async (options) => {
    try {
      const { user_id } = options;
      const response = await findUser(user_id);

      if (response.status >= 300) {
        return {
          status: response.status,
          data: { error: response.error },
        };
      }

      const reqSender = response.data;
      const chatIds = reqSender.direct_chats;

      const chatPreviews = await Promise.all(
        chatIds.map(async (chatId) => {
          const chat = await Chat.findById(chatId).populate({
            path: "partecipants",
            select: "username",
          });

          if (!chat) {
            return null;
          }

          const lastMessage = chat.messages[chat.messages.length - 1];
          const sentByMe = chat.partecipants[lastMessage.sender] === reqSender.username;

          const recipientIndex = chat.partecipants.findIndex((participant) => participant._id.toString() !== reqSender._id.toString());
          const recipient = chat.partecipants[recipientIndex].username;
          console.log(chat.last_modified.toJSON());
          return {
            _id: chat._id.toString(),
            recipient: recipient,
            last_message: lastMessage.text,
            sent_by_me: sentByMe,
            last_modified: chat.last_modified,
          };
        })
      );

      const filteredChatPreviews = chatPreviews.filter((chatPreview) => chatPreview !== null);

      return {
        status: 200,
        data: filteredChatPreviews,
      };
    } catch (err) {
      console.log(err);
    }
  },
  /**
   * @param options.identifier The identifier of the chat
   */
  getChatById: async (options) => {
    const { identifier, user_id, last_loaded_message } = options;

    let response = await findChat(identifier);
    if (response.status >= 300) {
      // If the response is an error, return the error message
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const chat = response.data;

    // Check if the request sender exists
    response = await findUser(user_id);
    if (response.status >= 300) {
      // If the response is an error, return the public user if the main user is active,
      // otherwise return "User not found" error
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const reqSender = response.data;

    // Check if the request sender is in the chat
    if (!chat.partecipants.includes(reqSender._id)) {
      return {
        status: 403,
        data: { error: `Chat not found.` },
      };
    }

    //check if the last_loaded_message is valid and exists
    if (!last_loaded_message) {
      chat.messages = chat.messages.slice(-MESSAGES_TO_LOAD);
      return {
        status: 200,
        data: chat,
      };
    }
    if (!mongooseObjectIdRegex.test(last_loaded_message)) {
      return {
        status: 400,
        data: { error: `Invalid last_loaded_message.` },
      };
    }

    let targetMessageIndex = chat.messages.findIndex((message) => message._id == last_loaded_message);

    let from = targetMessageIndex - MESSAGES_TO_LOAD >= 0 ? targetMessageIndex - MESSAGES_TO_LOAD : 0;
    let to = targetMessageIndex >= 0 ? targetMessageIndex : 0;

    chat.messages = chat.messages.slice(from, to);

    if (chat.messages.length == 0) {
      return {
        status: 404,
        data: { error: `No messages found.` },
      };
    }

    return {
      status: 200,
      data: chat,
    };
  },

  getChatByUser: async (options) => {
    const { identifier, user_id } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const sender = response.data;

    response = await findUser(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const recipient = response.data;

    let chat = await Chat.findOne({ partecipants: { $all: [sender._id, recipient._id] } });

    if (!chat) {
      return {
        status: 404,
        data: { error: `Chat not found.` },
      };
    }

    //prendi gli ultimi 20 messaggi
    chat.messages = chat.messages.slice(-MESSAGES_TO_LOAD);

    return {
      status: 200,
      data: chat,
    };
  },

  /**
   * @param options.identifier The identifier of recipient
   * @param options.message The message to send
   */
  sendDirectMessage: async (options) => {
    const { identifier, user_id, message } = options;
    let response = await findUser(user_id);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const sender = response.data;

    response = await findUser(identifier);
    if (response.status >= 300) {
      return {
        status: response.status,
        data: { error: response.error },
      };
    }
    const recipient = response.data;

    // Check if the message is valid
    if (!message || message == `` || message.length > DIRECT_MESSAGE_MAX_LENGTH) {
      return {
        status: 400,
        data: { error: `Message can't be empty or longer than ${DIRECT_MESSAGE_MAX_LENGTH} characters long.` },
      };
    }

    const newMessage = {
      sender: 0,
      text: message.replace(/\s+/g, ` `), // Replace multiple spaces with a single space
      timestamp: Date.now(),
    };

    //Check if the sender already has a chat with the recipient
    let chat = await Chat.findOne({ partecipants: { $all: [sender._id, recipient._id] } });
    // If the chat exists, add the message to the chat
    if (chat) {
      newMessage.sender = chat.partecipants.indexOf(sender._id);
      chat.messages.push(newMessage);
      chat.last_modified = Date.now();
      await chat.save();
      return {
        status: 200,
        data: chat,
      };
    }

    // If the chat doesn't exist, create a new chat
    chat = new Chat({
      partecipants: [sender._id, recipient._id],
      messages: [newMessage],
      last_modified: Date.now(),
    });
    await chat.save();
    // Add the chat to the sender and recipient
    sender.direct_chats.push(chat._id);
    recipient.direct_chats.push(chat._id);
    await sender.save();
    await recipient.save();

    chat.messages = chat.messages.slice(-MESSAGES_TO_LOAD);
    return {
      status: 200,
      data: chat,
    };
  },
};
