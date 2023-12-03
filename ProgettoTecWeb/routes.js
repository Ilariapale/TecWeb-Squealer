module.exports = function (app) {
  /*
   * Routes
   */
  app.use("/channels", require("./routes/channels.route"));
  app.use("/keywords", require("./routes/keywords.route"));
  app.use("/squeals", require("./routes/squeals.route"));
  app.use("/users", require("./routes/users.route"));
  app.use("/chats", require("./routes/chats.route"));
  app.use("/comments", require("./routes/comments.route"));
  app.use("/auth", require("./routes/auth.route"));
  app.use("/media", require("./routes/media.route"));
};
