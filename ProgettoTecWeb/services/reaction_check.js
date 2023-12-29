const cron = require("node-cron");
const { Notification, User } = require("./schemas");
const { charQuotaGained, charQuotaLost } = require("./messages");

const {
  DAILY_CHAR_QUOTA,
  WEEKLY_CHAR_QUOTA,
  MONTHLY_CHAR_QUOTA,
  VERY_POSITIVE_THRESHOLD,
  POSITIVE_THRESHOLD,
  NEGATIVE_THRESHOLD,
  VERY_NEGATIVE_THRESHOLD,
  CHAR_QUOTA_REWARD,
  BIG_CHAR_QUOTA_REWARD,
  CM_FACTOR,
  MIN_SQUEAL_PERCENTAGE,
  RESET_THRESHOLD,
} = require("./constants");

let users;

//every day at midnight
const check_init = (req, res) => {
  cron.schedule("0 0 * * *", () => {
    check();
  });
};

const check = async () => {
  await setTags();
  await setMetrics();
  await setRewards();
};

const setTags = async () => {
  await findSpecificUsers();

  //users -> user {username, _id, reaction_metrics, squeals.posted}
  //squeals.posted -> squeal {_id, created_at, reactions, reaction_tag}

  // For each squeal of each user created after reaction_metrics.last_checkpoint
  // check the number of reactions and update reaction_tag
  // If the number of positive reactions exceeds 0.25*impressions and the number of negative reactions exceeds 0.25*impressions, reaction_tag = "controversial"
  // If the number of positive reactions exceeds 0.25*impressions, reaction_tag = "popular"
  // If the number of negative reactions exceeds 0.25*impressions, reaction_tag = "unpopular"
  // else reaction_tag = "none"

  users.forEach(async (user) => {
    user.squeals.posted.forEach(async (squeal) => {
      if (squeal.created_at < user.reaction_metrics.last_checkpoint) return;

      const impressions = squeal.impressions;
      const positive_reactions_percentage = (squeal.reactions.positive_reactions / (impressions + 1)) * 100;
      const negative_reactions_percentage = (squeal.reactions.negative_reactions / (impressions + 1)) * 100;

      if (positive_reactions_percentage >= CM_FACTOR && negative_reactions_percentage >= CM_FACTOR) {
        squeal.reaction_tag = "controversial";
      } else if (positive_reactions_percentage >= CM_FACTOR) {
        squeal.reaction_tag = "popular";
      } else if (negative_reactions_percentage >= CM_FACTOR) {
        squeal.reaction_tag = "unpopular";
      } else {
        squeal.reaction_tag = "none";
      }

      await squeal.save();
    });
  });
};

const setMetrics = async () => {
  await findSpecificUsers();

  const updateOperations = users.map((user) => {
    const squealsToUpdate = user.squeals.posted.filter((squeal) => squeal.created_at >= user.reaction_metrics.last_checkpoint);

    const positiveSqueals = squealsToUpdate.filter((squeal) => squeal.reaction_tag === "popular").length;

    const negativeSqueals = squealsToUpdate.filter((squeal) => squeal.reaction_tag === "unpopular").length;

    const totalSqueals = squealsToUpdate.length;

    return {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            "reaction_metrics.positive_squeals": positiveSqueals,
            "reaction_metrics.negative_squeals": negativeSqueals,
            "reaction_metrics.total_squeals": totalSqueals,
          },
        },
      },
    };
  });

  await User.bulkWrite(updateOperations);
};

const setRewards = async () => {
  await findSpecificUsers();

  const updateOperations = users.map((user) => {
    const positiveSqueals = user.reaction_metrics.positive_squeals;
    const negativeSqueals = user.reaction_metrics.negative_squeals;
    const totalSqueals = user.reaction_metrics.total_squeals;

    const minPositivePercentage = positiveSqueals / totalSqueals >= MIN_SQUEAL_PERCENTAGE;
    const minNegativePercentage = negativeSqueals / totalSqueals >= MIN_SQUEAL_PERCENTAGE;

    const enoughPositive = positiveSqueals >= POSITIVE_THRESHOLD && minPositivePercentage;
    const enoughNegative = negativeSqueals >= NEGATIVE_THRESHOLD && minNegativePercentage;
    const enoughVeryPositive = positiveSqueals >= VERY_POSITIVE_THRESHOLD && minPositivePercentage;
    const enoughVeryNegative = negativeSqueals >= VERY_NEGATIVE_THRESHOLD && minNegativePercentage;

    let reward;

    if (enoughVeryPositive) {
      if (enoughVeryNegative) {
        // ++ --
        reward = {
          daily: 0,
          weekly: 0,
          monthly: 0,
        };
      } else if (enoughNegative) {
        // ++ -
        const fact = BIG_CHAR_QUOTA_REWARD - CHAR_QUOTA_REWARD;
        reward = {
          daily: fact * DAILY_CHAR_QUOTA,
          weekly: fact * WEEKLY_CHAR_QUOTA,
          monthly: fact * MONTHLY_CHAR_QUOTA,
        };
      } else {
        // ++
        const fact = BIG_CHAR_QUOTA_REWARD;
        reward = {
          daily: fact * DAILY_CHAR_QUOTA,
          weekly: fact * WEEKLY_CHAR_QUOTA,
          monthly: fact * MONTHLY_CHAR_QUOTA,
        };
      }
    } else if (enoughVeryNegative) {
      if (enoughPositive) {
        //-- +
        const fact = CHAR_QUOTA_REWARD - BIG_CHAR_QUOTA_REWARD;
        reward = {
          daily: fact * DAILY_CHAR_QUOTA,
          weekly: fact * WEEKLY_CHAR_QUOTA,
          monthly: fact * MONTHLY_CHAR_QUOTA,
        };
      } else {
        //--
        reward = {
          daily: -BIG_CHAR_QUOTA_REWARD * DAILY_CHAR_QUOTA,
          weekly: -BIG_CHAR_QUOTA_REWARD * WEEKLY_CHAR_QUOTA,
          monthly: -BIG_CHAR_QUOTA_REWARD * MONTHLY_CHAR_QUOTA,
        };
      }
    } else if (enoughPositive) {
      if (enoughNegative) {
        // + -
        reward = {
          daily: 0,
          weekly: 0,
          monthly: 0,
        };
      } else {
        // +
        reward = {
          daily: CHAR_QUOTA_REWARD * DAILY_CHAR_QUOTA,
          weekly: CHAR_QUOTA_REWARD * WEEKLY_CHAR_QUOTA,
          monthly: CHAR_QUOTA_REWARD * MONTHLY_CHAR_QUOTA,
        };
      }
    } else if (enoughNegative) {
      // -
      reward = {
        daily: -CHAR_QUOTA_REWARD * DAILY_CHAR_QUOTA,
        weekly: -CHAR_QUOTA_REWARD * WEEKLY_CHAR_QUOTA,
        monthly: -CHAR_QUOTA_REWARD * MONTHLY_CHAR_QUOTA,
      };
    } else {
      if ((enoughNegative || enoughPositive || enoughVeryNegative || enoughVeryPositive) && DEBUG) {
      }

      if (totalSqueals >= RESET_THRESHOLD) {
        reward = {
          daily: 0,
          weekly: 0,
          monthly: 0,
        };
      }
    }

    if (!reward) return {};

    return {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $inc: {
            "char_quota.daily": reward.daily,
            "char_quota.weekly": reward.weekly,
            "char_quota.monthly": reward.monthly,
            "char_quota.earned_daily": reward.daily,
            "char_quota.earned_weekly": reward.weekly,
          },
          $set: {
            "reaction_metrics.last_checkpoint": new Date(),
            "reaction_metrics.positive_squeals": 0,
            "reaction_metrics.negative_squeals": 0,
            "reaction_metrics.total_squeals": 0,
          },
        },
      },
    };
  });

  const operations = updateOperations.filter((op) => op.updateOne);

  await sendNotification(operations);
  await User.bulkWrite(operations);
};

const sendNotification = async (operations) => {
  const notifications = [];

  operations.forEach((op) => {
    const userId = op.updateOne.filter._id;
    const user = users.find((u) => u._id.toString() === userId.toString());

    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    const rewardDaily = op.updateOne.update.$inc["char_quota.daily"];

    let notificationText = "";

    if (rewardDaily > 0) {
      notificationText = charQuotaGained();
    } else if (rewardDaily < 0) {
      notificationText = charQuotaLost();
    } else {
      // No change in quota
      return;
    }

    const notification = new Notification({
      user_ref: userId,
      content: notificationText,
      created_at: new Date(),
      id_code: "charQuotaUpdate",
      source: "system",
    });

    notifications.push(notification);
  });

  let inserted_notifications;
  // Save notifications in the database
  if (notifications.length > 0) {
    inserted_notifications = await Notification.insertMany(notifications);
  }
  // Add notifications to users
  if (!inserted_notifications) return;
  await User.bulkWrite(
    inserted_notifications.map((notification) => ({
      updateOne: {
        filter: { _id: notification.user_ref },
        update: { $push: { notifications: notification._id } },
      },
    }))
  );
};

const findSpecificUsers = async () => {
  users = await User.find({}, "username _id reaction_metrics char_quota squeals.posted").populate({
    path: "squeals.posted",
    select: "_id created_at reactions.positive_reactions reactions.negative_reactions reaction_tag impressions",
  });
};

module.exports = {
  check_init,
};
