const cron = require("node-cron");
const { User, Guest } = require("./schemas");

const { EXTRA_DAILY_CHAR_QUOTA, DAILY_CHAR_QUOTA, WEEKLY_CHAR_QUOTA, MONTHLY_CHAR_QUOTA } = require("./constants");

const daily = "0 0 * * *";
const weekly = "0 0 * * 0";
const monthly = "0 0 1 * *";
const annual = "0 0 1 1 *";

//every day at midnight
const character_reset_init = (req, res) => {
  cron.schedule(daily, () => {
    daily_reset();
  });
  cron.schedule(weekly, () => {
    setTimeout(() => {
      weekly_reset();
    }, 5000); // 2000 milliseconds = 2 seconds
  });
  cron.schedule(monthly, () => {
    resetGuests(); //reset guests every month
    setTimeout(() => {
      monthly_reset();
    }, 10000); // 10000 milliseconds = 10 seconds
  });
  cron.schedule(annual, () => {
    annual_reset();
  });
};

const daily_reset = async () => {
  console.log("daily reset..");
  const users = await User.find({});
  const promises = users.map((user) => {
    const newDailyQuota = DAILY_CHAR_QUOTA + user.char_quota.earned_daily + user.char_quota.bought_daily - (EXTRA_DAILY_CHAR_QUOTA - user.char_quota.extra_daily);
    return User.updateOne({ _id: user._id }, { $set: { "char_quota.daily": newDailyQuota, "char_quota.extra_daily": EXTRA_DAILY_CHAR_QUOTA } });
  });
  await Promise.all(promises);
  console.log("daily reset done");
};
const weekly_reset = async () => {
  console.log("weekly reset..");
  const users = await User.find({});
  const promises = users.map((user) => {
    const newWeeklyQuota = WEEKLY_CHAR_QUOTA + user.char_quota.earned_weekly + user.char_quota.bought_weekly;
    return User.updateOne({ _id: user._id }, { $set: { "char_quota.weekly": newWeeklyQuota } });
  });
  await Promise.all(promises);
  console.log("weekly reset done");
};

const monthly_reset = async () => {
  console.log("monthly reset..");
  const users = await User.find({});
  const promises = users.map((user) => {
    const newMonthlyQuota = MONTHLY_CHAR_QUOTA + user.char_quota.bought_monthly;
    return User.updateOne(
      { _id: user._id },
      {
        $set: {
          "char_quota.monthly": newMonthlyQuota,
          "char_quota.earned_daily": 0,
          "char_quota.earned_weekly": 0,
        },
      }
    );
  });
  await Promise.all(promises);
  console.log("monthly reset done");
};

const annual_reset = async () => {
  console.log("annual reset..");
  await User.updateMany(
    {},
    {
      $set: {
        "char_quota.bought_daily": 0,
        "char_quota.bought_weekly": 0,
        "char_quota.bought_monthly": 0,
        "char_quota.earned_daily": 0,
        "char_quota.earned_weekly": 0,
        "char_quota.extra_daily": EXTRA_DAILY_CHAR_QUOTA,
        "char_quota.daily": DAILY_CHAR_QUOTA,
        "char_quota.weekly": WEEKLY_CHAR_QUOTA,
        "char_quota.monthly": MONTHLY_CHAR_QUOTA,
      },
    }
  );
  console.log("annual reset done");
};

const resetGuests = async () => {
  await Guest.deleteMany({});
};

module.exports = {
  character_reset_init,
  daily_reset,
  weekly_reset,
  monthly_reset,
};
