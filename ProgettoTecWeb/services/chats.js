const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword, Chat } = require("./schemas");
const { findUser, findChat } = require("./utils");
const { DIRECT_MESSAGE_MAX_LENGTH } = require("./constants");

module.exports = {
  /**
   * @param options.identifier The identifier of the chat
   */
  getChat: async (options) => {
    const { identifier, user_id } = options;

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
        data: { error: "Chat not found" },
      };
    }

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
    if (!message || message == "" || message.length > DIRECT_MESSAGE_MAX_LENGTH) {
      return {
        status: 400,
        data: { error: "Invalid message" },
      };
    }

    const newMessage = {
      sender: 0,
      text: message,
      timestamp: Date.now(),
    };

    //Check if the sender already has a chat with the recipient
    let chat = await Chat.findOne({ partecipants: { $all: [sender._id, recipient._id] } });
    // If the chat exists, add the message to the chat
    if (chat) {
      newMessage.sender = chat.partecipants.indexOf(sender._id);
      chat.messages.push(newMessage);
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
      created_at: Date.now(),
    });
    await chat.save();
    // Add the chat to the sender and recipient
    sender.direct_chats.push(chat._id);
    recipient.direct_chats.push(chat._id);
    await sender.save();
    await recipient.save();
    return {
      status: 200,
      data: chat,
    };
  },
};
