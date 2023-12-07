const mentionNotification = (username, message, type = "text") =>
  `@${username} has mentioned you in a ${type} squeal! Check it out!\n'${message.substring(0, 30)}${message.length > 30 ? ".." : ""}'.`;
//TODO controllare il tipo del messaggio ad esempio se è una posizione o una immagine, il substring non funziona
//TODO controllare perchè quando si cambia il proprietario di un canale la notifica non viene inviata
const squealInOfficialChannel = (message, channels) =>
  `Good news! Your squeal has been featured in ${channels.length > 1 ? "some" : "an"} official channel${channels.length > 1 ? "s" : ""}! It can now be found in §${channels.join(
    ", §"
  )}. Check it out!\n'${message.substring(0, 30)}${message.length > 30 ? ".." : ""}'.`;

const squealRemovedFromOfficialChannel = (message, channels) =>
  `Bad news! Your squeal has been removed from ${channels.length > 1 ? "some" : "an"} official channel${
    channels.length > 1 ? "s" : ""
  }! It can no longer be found in §${channels.join(", §")}.\n'${message.substring(0, 30)}${message.length > 30 ? ".." : ""}'.`;

const squealUpdatedOfficialChannel = (message, added_channels, removed_channels) =>
  `Good news and bad news! Your squeal has been featured in ${added_channels.length > 1 ? "some" : "an"} official channel${added_channels.length > 1 ? "s" : ""} and removed from ${
    removed_channels.length > 1 ? "some " : "an"
  }other${removed_channels.length > 1 ? "s" : ""}! It can now be found in §${added_channels.join(", §")} but no longer in §${removed_channels.join(
    ", §"
  )}. Check it out!\n'${message.substring(0, 30)}${message.length > 30 ? ".." : ""}'.`;

const newOwnerNotification = (username, channel) => `Congratulations @${username}! You are now the owner of §${channel} channel!`;

const removedOwnerNotification = (username, channel) => `Oh no, @${username}! You are no longer the owner of §${channel} channel!`;

const channelDeletedNotification = (username, channel, role) => `Oh no, @${username}! The channel §${channel} you were ${role} of has been deleted!`;

const welcomeNotification = (username) => `Welcome to Squealer @${username}! Check out your first squeal by clicking on the notification.`;

const welcomeMessage = (username) => `Welcome to Squealer @${username}!`;

const updatedManagedAccountNotification = (username) =>
  `Your managed account @${username} has been updated and it's no longer a VIP account. You won't be able to manage that account anymore.`;

const updatedSMMNotification = (username) => `Your SMM account @${username} has been updated and it's no longer a SMM account. They won't be able to manage your account anymore.`;

const deletedManagedAccountNotification = (username) => `Your managed account @${username} has been deleted. You won't be able to manage that account anymore.`;

const deletedSMMNotification = (username) => `Your SMM account @${username} has been deleted. They won't be able to manage your account anymore.`;

const newSMMNotification = (username) => `Congratulation! @${username} accepted your request and is now your SMM!`;

const newManagedAccountNotification = (username) => `Congratulation! You are now a SMM account for @${username}!`;

const newSMMrequestNotification = (username) => `@${username} requested you to be their SMM!`;

const noLongerSMM = (username) => `You are no longer @${username}'s SMM!`;

const noLongerManagedAccount = (username) => `@${username} removed you from their managed account, they're no longer your SMM!`;

const someoneCommentedYourSqueal = (username, comment) =>
  `Hey! @${username} just added a comment to your squeal! Check it out!\n'${comment.substring(0, 30)}${comment.length > 30 ? ".." : ""}'.`;

const bannedUserNotification = (username) => `@${username}, you have been temporarely banned from Squealer! You will no longer be able to post or comments squeals.`;

const unbannedUserNotification = (username) => `@${username}, you have been unbanned from Squealer! You can now post and comment squeals again.`;

const declinedSMMrequestNotification = (username) => `@${username} declined your request to be your SMM! You'll be luckier next time!`;

const updatedProfileTypeNotification = (username, old_account_type, new_account_type, old_professional_type, new_professional_type) =>
  old_account_type !== new_account_type
    ? old_professional_type !== new_professional_type
      ? `@${username}, your account type has been changed from ${old_account_type} to ${new_account_type} and your professional type is now ${new_professional_type} instead of ${old_professional_type}!`
      : `@${username}, your account type has been changed from ${old_account_type} to ${new_account_type}!`
    : `@${username}, your professional type has been changed from ${old_professional_type} to ${new_professional_type}!`;

const charQuotaGained = () => `Your squeals were a success! You have gained some characters quota! :)`;
const charQuotaLost = () => `Your squeals were a disaster! You have lost some characters quota! :(`;

module.exports = {
  mentionNotification,
  newOwnerNotification,
  removedOwnerNotification,
  channelDeletedNotification,
  welcomeNotification,
  updatedManagedAccountNotification,
  updatedSMMNotification,
  welcomeMessage,
  deletedManagedAccountNotification,
  deletedSMMNotification,
  newSMMNotification,
  newManagedAccountNotification,
  newSMMrequestNotification,
  noLongerSMM,
  noLongerManagedAccount,
  squealInOfficialChannel,
  squealRemovedFromOfficialChannel,
  squealUpdatedOfficialChannel,
  someoneCommentedYourSqueal,
  bannedUserNotification,
  unbannedUserNotification,
  declinedSMMrequestNotification,
  updatedProfileTypeNotification,
  charQuotaGained,
  charQuotaLost,
};
