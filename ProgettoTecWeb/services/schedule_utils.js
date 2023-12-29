const { User } = require("./schemas");
const squeals = require("../services/squeals");
const nextTick = require("next-tick");

const cron = require("node-cron");
const regex = /^(\d+)\s+(hours|mins)$/;
const MAX_REPEAT = 100;

const alreadySendingPosition = {};

function getNextDate(nowDate, unit, quantity) {
  let date_to_run;
  if (unit == "hours") {
    date_to_run = new Date(nowDate.getTime() + 1000 * 60 * 60 * quantity);
  } else if (unit == "mins") {
    date_to_run = new Date(nowDate.getTime() + 1000 * 60 * quantity);
  } else {
    //console.log("Invalid unit");
  }
  if (date_to_run == null || date_to_run == undefined) {
    return null;
  }

  return parseDateIntoCronString(date_to_run);
}

function parseTickRate(input) {
  const match = input.match(regex);
  if (("match:", match)) {
    const num = parseInt(match[1]);
    const unit = match[2];
    if ((unit == "hours" && (num > 24 || num <= 0)) || (unit == "mins" && (num > 60 || num <= 0))) {
      return null; // The string does not match the expected format
    }
    return { num, unit };
  } else {
    return null; // The string does not match the expected format
  }
}

function parseDateIntoCronString(date) {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const cronString = `${minutes} ${hours} ${day} ${month} *`;
  return cronString;
}

function parseTickRateIntoCronString(tick_rate) {
  //{num: 1, unit: "hours"}
  const { num, unit } = tick_rate;
  let cronString;
  if (unit == "hours") {
    cronString = `0 */${num} * * *`;
  } else if (unit == "mins") {
    cronString = `*/${num} * * * *`;
  } else {
    // console.log("Invalid unit");
  }
  return cronString;
}

async function scheduleSqueals(input, options) {
  const { schedule_type, tick_rate, scheduled_date, repeat } = input;
  switch (schedule_type) {
    case "postPeriodicallyForLimitedTimes":
      return await postPeriodicallyForLimitedTimes(tick_rate, repeat, options);
    case "postAtIntervalsUntilDate":
      return await postAtIntervalsUntilDate(tick_rate, scheduled_date, options);
    case "postAfterDelay":
      return await postAfterDelay(tick_rate, options);
    case "postAtDate":
      return await postAtDate(scheduled_date, options);
    default:
      return {
        status: 400,
        message: "Invalid input. Please check the format of the schedule_type field.",
      };
  }
}

async function postPositionScheduledSqueal(userId, socketId, data) {
  try {
    const { username } = await User.findOne({ _id: userId }, { username: 1 });
    const options = alreadySendingPosition[username];
    options.content += ` , ${data[0]} ${data[1]}`;
    const result = await squeals.createSqueal(options);
    return result;
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      message: err || "Something went wrong.",
    };
  }
}
async function deleteFromSendingPositionObject(userId) {
  try {
    const { username } = await User.findOne({ _id: userId }, { username: 1 });
    delete alreadySendingPosition[username];
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      message: err || "Something went wrong.",
    };
  }
}

//socket: send_position_to_server, send_last_position_to_server
async function askForPositionToClient(options, is_last = false) {
  try {
    const { _id } = await User.findOne({ username: options.user_id }, { _id: 1 });
    const recipientSocketId = options.connected_users[_id];
    if (recipientSocketId) {
      if (is_last) {
        options.io.to(recipientSocketId).emit("send_last_position_to_server");
      } else {
        options.io.to(recipientSocketId).emit("send_position_to_server");
      }
      return {
        status: 200,
        message: "Signal for scheduled position post sent successfully",
      };
    } else {
      return {
        status: 400,
        message: "User " + options.user_id + " is not online",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      message: err || "Something went wrong.",
    };
  }
}

// Post every 'tick_rate' for a 'repeat' number of times
async function postPeriodicallyForLimitedTimes(tick_rate, repeat, options) {
  const tr = parseTickRate(tick_rate);
  const rep = parseInt(repeat);
  if (tr == null || isNaN(rep)) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate and repeat fields.",
    };
  }
  if (rep > MAX_REPEAT || rep <= 1) {
    return {
      status: 400,
      message: `Invalid input. Repeat must be less than ${MAX_REPEAT}.`,
    };
  }

  const dateNow = new Date();
  //check if another position post is already scheduled
  if (alreadySendingPosition[options.user_id]) {
    return {
      status: 400,
      message: "You can't schedule a position post while another one is already scheduled.",
    };
  } else {
    alreadySendingPosition[options.user_id] = options;
  }
  //-----
  for (let i = 1; i <= rep; i++) {
    const date_to_run = getNextDate(dateNow, tr.unit, tr.num * i);

    if (date_to_run == null || date_to_run == undefined) {
      delete alreadySendingPosition[options.user_id];
      return {
        status: 400,
        message: "Invalid input. Please check the format of the tick rate field.",
      };
    }
    const opt = options;

    //----------------  CRON JOB ----------------

    const cronJob = cron.schedule(date_to_run, async () => {
      if (opt.content_type == "position") {
        const res = await askForPositionToClient(opt, i == rep);
        nextTick(() => cronJob.stop());
        return res;
      } else {
        const scheduled_squeal_data = {
          number: i,
          date: new Date(),
        };
        opt.scheduled_squeal_data = scheduled_squeal_data;

        const result = await squeals.createSqueal(opt);
        nextTick(() => cronJob.stop());
        if (result.status >= 300) {
          return {
            status: result.status,
            message: result.data.error,
          };
        }
      }
    });
    //----------------------------------------------
  }

  return {
    status: 200,
    message: "Squeals scheduled successfully",
  };
}

// Post every 'tick_rate' until 'scheduled_date'
async function postAtIntervalsUntilDate(tick_rate, scheduled_date, options) {
  const tr = parseTickRate(tick_rate);
  if (tr == null || scheduled_date == null) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate and repeat fields.",
    };
  }

  let dateNow = new Date();
  const date_to_stop = new Date(scheduled_date);
  const cronString = parseTickRateIntoCronString(tr);
  if (cronString == null || cronString == undefined) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate field.",
    };
  }

  //check if another position post is already scheduled
  if (alreadySendingPosition[options.user_id]) {
    return {
      status: 400,
      message: "You can't schedule a position post while another one is already scheduled.",
    };
  } else {
    alreadySendingPosition[options.user_id] = options;
  }
  //-----
  let count = 0;

  // ----------------  CRON JOB ----------------
  const cronJob = cron.schedule(cronString, async () => {
    if (dateNow >= date_to_stop) {
      // Stop the cron job after the current iteration is finished
      nextTick(() => cronJob.stop());

      return {
        status: 200,
        message: "Squeals scheduled successfully",
      };
    } else {
      if (options.content_type == "position") {
        let is_last = false;
        if (dateNow + (tr.unit == "hours" ? 1000 * 60 * 60 * tr.num : 1000 * 60 * tr.num) >= date_to_stop) is_last = true;
        return await askForPositionToClient(options, is_last);
      } else {
        // Continue with the normal workflow
        dateNow = new Date();
        const scheduled_squeal_data = {
          number: ++count,
          date: dateNow,
        };
        options.scheduled_squeal_data = scheduled_squeal_data;

        const result = await squeals.createSqueal(options);
        if (result.status >= 300) {
          return {
            status: result.status,
            message: result.data.error,
          };
        }
      }
    }
  });
  // --------------------------------------------------------

  return {
    status: 200,
    message: "Squeals scheduled successfully",
  };
}

// Post after a delay of 'tick_rate'
async function postAfterDelay(tick_rate, options) {
  const tr = parseTickRate(tick_rate);
  if (tr == null) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate field.",
    };
  }

  const dateNow = new Date();
  const date_to_run = getNextDate(dateNow, tr.unit, tr.num);
  if (date_to_run == null || date_to_run == undefined) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate field.",
    };
  }

  if (alreadySendingPosition[options.user_id]) {
    return {
      status: 400,
      message: "You can't schedule a position post while another one is already scheduled.",
    };
  } else {
    alreadySendingPosition[options.user_id] = options;
  }

  // ----------------  CRON JOB ----------------
  const cronJob = cron.schedule(date_to_run, async () => {
    if (options.content_type == "position") {
      const res = await askForPositionToClient(options, true);
      nextTick(() => cronJob.stop());
      return res;
    } else {
      const scheduled_squeal_data = {
        number: 1,
        date: new Date(),
      };

      options.scheduled_squeal_data = scheduled_squeal_data;
      const result = await squeals.createSqueal(options);
      nextTick(() => cronJob.stop());
      if (result.status >= 300) {
        return {
          status: result.status,
          message: result.data.error,
        };
      }
    }
  });
  // -------------------------------------------------

  return {
    status: 200,
    message: "Squeals scheduled successfully",
  };
}

// Post at a specific date
async function postAtDate(scheduled_date, options) {
  const date_to_run = new Date(scheduled_date);
  if (date_to_run == null || date_to_run == undefined) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate field.",
    };
  }
  const cronString = parseDateIntoCronString(date_to_run);
  if (cronString == null || cronString == undefined) {
    return {
      status: 400,
      message: "Invalid input. Please check the format of the tick rate field.",
    };
  }
  if (alreadySendingPosition[options.user_id]) {
    return {
      status: 400,
      message: "You can't schedule a position post while another one is already scheduled.",
    };
  } else {
    alreadySendingPosition[options.user_id] = options;
  }
  // ----------------  CRON JOB ----------------
  const cronJob = cron.schedule(cronString, async () => {
    if (options.content_type == "position") {
      const res = await askForPositionToClient(options, true);
      nextTick(() => cronJob.stop());
      return res;
    } else {
      const scheduled_squeal_data = {
        number: 1,
        date: new Date(),
      };
      options.scheduled_squeal_data = scheduled_squeal_data;
      const result = await squeals.createSqueal(options);
      nextTick(() => cronJob.stop());
      if (result.status >= 300) {
        return {
          status: result.status,
          message: result.data.error,
        };
      }
    }
  });
  // ---------------- ----------------------------------

  return {
    status: 200,
    message: "Squeals scheduled successfully",
  };
}
module.exports = { scheduleSqueals, postPositionScheduledSqueal, deleteFromSendingPositionObject };
