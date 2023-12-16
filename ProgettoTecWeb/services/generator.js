const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, CommentSection } = require("./schemas");
const { bcrypt, securityLvl } = require("./utils");
const { squealInOfficialChannel } = require("./messages");
const { PASSWORD_MIN_LENGTH, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, TIERS } = require("./constants");
const cron = require("node-cron");

async function initializeDB() {
  await createModsProfiles();
  //controlliamo se nel db è presente un utente con username admin
  let admin = await User.findOne({ username: "ADMIN" });
  let controversialExists = await Channel.exists({ name: "CONTROVERSIAL" });
  let emergencyExists = await Channel.exists({ name: "EMERGENCY" });
  let randomExists = await Channel.exists({ name: "RANDOM" });
  let weatherExists = await Channel.exists({ name: "RANDOM_WEATHER" });
  let imageExists = await Channel.exists({ name: "RANDOM_IMAGES" });

  let controversial, emergency, random, weather, image;

  if (!admin) {
    const salt = await bcrypt.genSalt(securityLvl);
    const hashedPassword = await bcrypt.hash("6E3^NcAEKOko)@8?o$;=", salt);

    //creiamo l'utente admin
    admin = new User({
      username: "ADMIN",
      password: hashedPassword,
      email: "admin@admin.com",
      account_type: "moderator",
      created_at: new Date(),
    });
    admin = await admin.save();
  }

  if (!controversialExists) {
    //Creiamo il canale CONTROVERSIAL
    controversial = new Channel({
      name: "CONTROVERSIAL",
      is_official: true,
      owner: admin._id,
      description: "Controversial squeals will be shown here",
      can_mute: "false",
      created_at: new Date(),
    });
    await controversial.save();
    admin.owned_channels.push(controversial._id);
  }

  if (!emergencyExists) {
    //Creiamo il canale EMERGENCY
    emergency = new Channel({
      name: "EMERGENCY",
      is_official: true,
      owner: admin._id,
      description: "Emergency squeals will be shown here",
      can_mute: "false",
      created_at: new Date(),
    });
    await emergency.save();
    admin.owned_channels.push(emergency._id);
  }

  if (!randomExists) {
    //Creiamo il canale RANDOM
    random = new Channel({
      name: "RANDOM",
      is_official: true,
      owner: admin._id,
      description: "Random squeals will be shown here",
      can_mute: "false",
      created_at: new Date(),
    });
    await random.save();
    admin.owned_channels.push(random._id);
  }

  if (!weatherExists) {
    //Creiamo il canale METEO
    weather = new Channel({
      name: "RANDOM_WEATHER",
      is_official: true,
      owner: admin._id,
      description: "Random city's weather will be shown here",
      can_mute: "false",
      created_at: new Date(),
    });
    await weather.save();
    admin.owned_channels.push(weather._id);
  }

  if (!imageExists) {
    //Creiamo la keyword RANDOM_IMAGE
    image = new Channel({
      name: "RANDOM_IMAGES",
      is_official: true,
      owner: admin._id,
      description: "Random images will be shown here",
      created_at: new Date(),
    });
    await image.save();
    admin.owned_channels.push(image._id);
  }

  //----------------------//
  await admin.save();
}

async function createModsProfiles() {
  const salt = await bcrypt.genSalt(securityLvl);
  const hashedPassword = await bcrypt.hash("password", salt);
  const initialUsers = [
    {
      username: "ilapale",
      email: "palestini.ilaria@gmail.com",
      password: hashedPassword,
      account_type: "moderator",
      created_at: Date.now(),
    },
    {
      username: "paulpaccy",
      email: "ssimonesanna@gmail.com",
      password: hashedPassword,
      account_type: "moderator",
      created_at: Date.now(),
    },
  ];
  const result = await User.findOne({});
  if (!result) {
    await User.insertMany(initialUsers);
    console.log("Initial users created");
  }
}

async function startAutomaticPost() {
  const cronWeather = cron.schedule("05 * * * *", async () => {
    postWeatherSqueals();
  });
  const cronRandom = cron.schedule("20 * * * *", async () => {
    postRandomSqueals();
  });
  const cronControversial = cron.schedule("35 * * * *", async () => {
    postControversialSqueals();
  });
  const cronImage = cron.schedule("50 * * * *", async () => {
    postRandomImage();
  });

  cronWeather.start();
  cronRandom.start();
  cronControversial.start();
  cronImage.start();
}

async function postWeatherSqueals() {
  const weatherChannel = await Channel.findOne({ name: "RANDOM_WEATHER" });
  const admin = await User.findOne({ username: "ADMIN" });
  const apiKey = "c60cc89ba06f0b9de4f847a9d30486fa";
  const cities = ["milan", "bologna", "rome", "florence", "naples", "iglesias", "teramo"];
  const random = Math.floor(Math.random() * cities.length);
  const city = cities[random].charAt(0).toUpperCase() + cities[random].slice(1); // Capitalize the first letter of the city
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(url).catch((err) => console.log(err));
  const data = await response.json();

  const cityname = data.name.charAt(0).toUpperCase() + data.name.slice(1); // Capitalize the first letter of the city
  if (!cityname || !data.weather[0].description || !data.main.temp || !data.main.temp_min || !data.main.temp_max) return console.log("Error while fetching weather data");
  const newSqueal = new Squeal({
    hex_id: admin.squeals.posted.length,
    user_id: admin._id,
    username: admin.username,
    content: `The weather in ${cityname} is ${data.weather[0].description}, the temperature is ${data.main.temp}°C, with a minimum of ${data.main.temp_min}°C and a maximum of ${data.main.temp_max}°C.`,
    recipients: {
      channels: [weatherChannel._id],
      keywords: ["weather", "random_weather", "random", "autoposting"],
    },
    owner: admin._id,
    created_at: new Date(),
    is_in_official_channel: true,
  });
  await newSqueal.save();
  admin.squeals.posted.push(newSqueal._id);
  await admin.save();
  weatherChannel.squeals.push(newSqueal._id);
  await weatherChannel.save();

  //comment section
  const commentSection = new CommentSection({
    squeal_ref: newSqueal._id,
  });
  await commentSection.save();
  newSqueal.comment_section = commentSection._id;
  await newSqueal.save();
}

async function postRandomSqueals() {
  const channel = await Channel.findOne({ name: "RANDOM" });
  //post a random squeal from a unofficial channel
  const squeals = await Squeal.find({ is_in_official_channel: false });

  if (squeals.length === 0) return;
  const randomIndex = Math.floor(Math.random() * squeals.length);
  const squeal = squeals[randomIndex];

  squeal.recipients.channels.push(channel);
  squeal.is_in_official_channel = true;
  await squeal.save();
  channel.squeals.push(squeal._id);
  await channel.save();
  const notification = new Notification({
    user_id: squeal.user_id,
    squeal_ref: squeal._id,
    channel_ref: channel._id,
    content: squealInOfficialChannel(squeal.content, [channel.name]),
    created_at: new Date(),
    id_code: "officialStatusUpdate",
  });
  await notification.save();
  await User.updateOne({ _id: squeal.user_id }, { $push: { notifications: notification._id } }).exec();
}

async function postControversialSqueals() {
  const channel = await Channel.findOne({ name: "CONTROVERSIAL" });
  const squeals = await Squeal.find({ reaction_tag: "controversial", _id: { $nin: channel.squeals } });
  if (squeals.length === 0) return;
  await Squeal.updateMany({ reaction_tag: "controversial", _id: { $nin: channel.squeals } }, { $push: { "recipients.channels": channel._id }, is_in_official_channel: true });

  channel.squeals.push(...squeals);
  await channel.save();
  //mandiamo notifica ai proprietari degli squeal

  for (let squeal of squeals) {
    const user = await User.findById(squeal.user_id);
    const notification = new Notification({
      user_id: user._id,
      squeal_ref: squeal._id,
      channel_ref: channel._id,
      content: squealInOfficialChannel(squeal.content, [channel.name]),
      created_at: new Date(),
      id_code: "officialStatusUpdate",
    });
    await notification.save();
    user.notifications.push(notification._id);
    await user.save();
  }
}

async function postRandomImage() {
  const admin = await User.findOne({ username: "ADMIN" });
  const channel = await Channel.findOne({ name: "RANDOM_IMAGES" });
  //creo un numero random da 0 a 1084
  const random = Math.floor(Math.random() * 1084);
  const squeal = new Squeal({
    hex_id: admin.squeals.posted.length,
    user_id: admin._id,
    username: admin.username,
    content: `https://picsum.photos/id/${random}/400/275`,
    recipients: {
      channels: [channel.id],
      keywords: ["random", "random_images", "images", "autoposting"],
    },
    content_type: "image",
    is_in_official_channel: true,
    user_id: admin._id,
    created_at: new Date(),
  });
  await squeal.save();
  admin.squeals.posted.push(squeal._id);
  await admin.save();
  channel.squeals.push(squeal._id);
  await channel.save();

  const commentSection = new CommentSection({
    squeal_ref: squeal._id,
  });
  await commentSection.save();
  squeal.comment_section = commentSection._id;
  await squeal.save();
}

module.exports = {
  initializeDB,
  startAutomaticPost,
};
