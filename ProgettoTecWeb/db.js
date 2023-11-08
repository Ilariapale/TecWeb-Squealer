const mongoose = require("mongoose");
const schemas = require("./services/schemas");
const bcrypt = require("bcryptjs");
const { securityLvl } = require("./config");
module.exports = {
  dbconnect: async () => {
    let dbname = "squealerDB";
    let credentials;
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
    try {
      credentials = require("./credentials.json"); //ricordarsi di spostare il file credentials sul server dell'università nella cartella routes
      console.log("credentials loaded");
    } catch (error) {
      credentials = undefined;
      console.log("credentials undefined");
      dbname = "test";
    }
    const mongouri = credentials
      ? `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}/${dbname}?authSource=admin&writeConcern=majority`
      : `mongodb://localhost:27017/${dbname}?writeConcern=majority`;
    await mongoose.connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set("strictQuery", false);

    const result = await schemas.User.findOne({});
    //If no data is found, create 2 users
    if (!result) {
      await schemas.User.insertMany(initialUsers);
      console.log("Initial users created");
    }

    console.log(`Connected to ${credentials?.site}'s MongoDB instance using Mongoose...`);
  },
};
