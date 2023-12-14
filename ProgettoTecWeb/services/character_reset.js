const cron = require("node-cron");
const mongoose = require("mongoose");
const {} = require("./utils");
const { charQuotaGained, charQuotaLost } = require("./messages");
const { User } = require("./schemas");

const {
  EXTRA_DAILY_CHAR_QUOTA,
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

const daily = "0 0 * * *";
const weekly = "0 0 * * 0";
const monthly = "0 0 1 * *";

//every day at midnight
const character_reset_init = (req, res) => {
  cron.schedule(daily, () => {
    daily_reset();
  });
  cron.schedule(weekly, () => {
    weekly_reset();
  });
  cron.schedule(monthly, () => {
    monthly_reset();
  });
};

const daily_reset = async () => {
  const users = await User.find({});
  const promises = users.map((user) => {
    const newDailyQuota = DAILY_CHAR_QUOTA + user.char_quota.earned_daily - (EXTRA_DAILY_CHAR_QUOTA - user.char_quota.extra_daily);
    return User.updateOne({ _id: user._id }, { $set: { "char_quota.daily": newDailyQuota, extra_daily: EXTRA_DAILY_CHAR_QUOTA } });
  });
  await Promise.all(promises);
};

const weekly_reset = async () => {
  const users = await User.find({});
  const promises = users.map((user) => {
    const newWeeklyQuota = WEEKLY_CHAR_QUOTA + user.char_quota.earned_weekly;
    return User.updateOne({ _id: user._id }, { $set: { "char_quota.weekly": newWeeklyQuota } });
  });
  await Promise.all(promises);
};

const monthly_reset = async () => {
  await User.updateMany(
    {},
    {
      $set: {
        "char_quota.monthly": MONTHLY_CHAR_QUOTA,
        "char_quota.earned_daily": 0,
        "char_quota.earned_weekly": 0,
      },
    }
  );
};

module.exports = {
  character_reset_init,
};
