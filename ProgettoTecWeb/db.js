const mongoose = require("mongoose");
module.exports = {
  dbconnect: async () => {
    let dbname = "test";
    let credentials;
    try {
      credentials = require("./credentials.json"); //ricordarsi di spostare il file credentials sul server dell'università nella cartella routes
      console.log("credentials loaded");
    } catch (error) {
      credentials = undefined;
      console.log("credentials undefined");
    }
    const mongouri = credentials
      ? `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}/${dbname}?authSource=admin&writeConcern=majority`
      : `mongodb://localhost:27017/${dbname}?writeConcern=majority`;
    await mongoose.connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set("strictQuery", false);

    console.log(`Connected to ${credentials?.site}'s MongoDB instance using Mongoose...`);
  },
};
