const mentionNotification = (username, message) => `@${username} has mentioned you in a squeal! Check it out!\n${message.substring(0, 30)}...`;

const officialNotificationAdd = (username, message, channel) =>
  `Congratulations @${username}! Your squeal has been featured on §${channel} channel! Check it out!\n"${message.substring(0, 30)}..."`;

const officialNotificationRemove = (username, message, channel) => `Oh no, @${username}! Your squeal has been removed from §${channel} channel.\n"${message.substring(0, 30)}..."`;

const newOwnerNotification = (username, channel) => `Congratulations @${username}! You are now the owner of §${channel} channel!`;

const removedOwnerNotification = (username, channel) => `Oh no, @${username}! You are no longer the owner of §${channel} channel!`;

const channelDeletedNotification = (username, channel, role) => `Oh no, @${username}! The channel §${channel} you were ${role} of has been deleted!`;

module.exports = {
  mentionNotification,
  officialNotificationAdd,
  officialNotificationRemove,
  newOwnerNotification,
  removedOwnerNotification,
  channelDeletedNotification,
};
