const cron = require("node-cron");
const { User } = require("./schemas");

const { EXTRA_DAILY_CHAR_QUOTA, DAILY_CHAR_QUOTA, WEEKLY_CHAR_QUOTA, MONTHLY_CHAR_QUOTA } = require("./constants");

const daily = "0 0 * * *";
const weekly = "0 0 * * 0";
const monthly = "0 0 1 * *";
const annual = "0 0 1 1 *";

//every day at midnight
const character_reset_init = (req, res) => {
  //annual_reset();
  cron.schedule(daily, () => {
    daily_reset();
  });
  cron.schedule(weekly, () => {
    weekly_reset();
  });
  cron.schedule(monthly, () => {
    monthly_reset();
  });
  cron.schedule(annual, () => {
    annual_reset();
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
//TODO finire
const annual_reset = async () => {
  await User.updateMany(
    {},
    {
      $set: {
        "char_quota.bought_daily": 0,
        "char_quota.bought_weekly": 0,
        "char_quota.bought_monthly": 0,
      },
    }
  );
};

module.exports = {
  character_reset_init,
};
