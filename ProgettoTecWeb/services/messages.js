const mentionNotification = (username, message) => `@${username} has mentioned you in a squeal! Check it out!\n${message.substring(0, 30)}...`;

const officialNotificationAdd = (username, message, channel) =>
  `Congratulations @${username}! Your squeal has been featured on §${channel} channel! Check it out!\n"${message.substring(0, 30)}..."`;

const officialNotificationRemove = (username, message, channel) => `Oh no, @${username}! Your squeal has been removed from §${channel} channel.\n"${message.substring(0, 30)}..."`;

const newOwnerNotification = (username, channel) => `Congratulations @${username}! You are now the owner of §${channel} channel!`;

const removedOwnerNotification = (username, channel) => `Oh no, @${username}! You are no longer the owner of §${channel} channel!`;

const channelDeletedNotification = (username, channel, role) => `Oh no, @${username}! The channel §${channel} you were ${role} of has been deleted!`;

const welcomeNotification = (username) => `Welcome to Squealer @${username}! Check out your first squeal by clicking on the notification.`;

const welcomeMessage = (username) => `Welcome to Squealer @${username}!`;

const updatedManagedAccountNotification = (username) =>
  `Your managed account @${username} has been updated and it's no longer a VIP account. You won't be able to manage that account anymore.`;

const updatedSMMNotification = (username) => `Your SMM account @${username} has been updated and it's no longer a SMM account. They won't be able to manage your account anymore.`;
module.exports = {
  mentionNotification,
  officialNotificationAdd,
  officialNotificationRemove,
  newOwnerNotification,
  removedOwnerNotification,
  channelDeletedNotification,
  welcomeNotification,
  updatedManagedAccountNotification,
  updatedSMMNotification,
  welcomeMessage,
};
