const express = require("express"),
  cookieParser = require("cookie-parser"),
  db = require("./db"),
  log = require("morgan"),
  path = require("path"),
  cors = require("cors"),
  multer = require("multer"),
  upload = multer(),
  http = require("http"),
  socketIo = require("socket.io"),
  app = express(),
  PORT = process.env.PORT || 8000,
  NODE_ENV = process.env.NODE_ENV || "development";
const server = http.createServer(app);
const io = socketIo(server);
const connectedUsers = {};
const { postPositionScheduledSqueal, deleteFromSendingPositionObject } = require("./services/schedule_utils");

app.set("port", PORT);
app.set("env", NODE_ENV);

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable("trust proxy");
io.on("connect", (socket) => {
  // Ricevi l'identificativo dell'utente quando si connette
  socket.on("authenticate", (userId) => {
    // Associa l'identificativo dell'utente al suo socket.id
    // console.log("authenticate: " + userId + " socket.id: " + socket.id);
    connectedUsers[userId] = socket.id;
  });

  socket.on("sending_position_to_server", async (userId, data) => {
    await postPositionScheduledSqueal(userId, socket.id, data);
  });

  socket.on("sending_last_position_to_server", async (userId, data) => {
    await postPositionScheduledSqueal(userId, socket.id, data);
    await deleteFromSendingPositionObject(userId);
  });
  // Disconnessione dell'utente
  socket.on("disconnect", () => {
    // Rimuovi l'utente dalla mappa quando si disconnette
    const userIdToRemove = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
    if (userIdToRemove) {
      delete connectedUsers[userIdToRemove];
    }
  });
});
app.use(cors());
//app.use(log("tiny"));
app.use(log(":date[clf] - :method  (:status) - :response-time ms :url (:res[content-length] byte)"));

// parse application/json
app.use(express.json());

// parse raw text
app.use(express.text());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Aggiungi il gestore per i WebSocket
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

app.use("/media", require("./routes/media.route"));
// parse multipart/form-data
app.use(upload.array());

app.use(express.static("public"));

require("./routes")(app);

console.log("dirname: " + __dirname);

app.use(express.static(__dirname + "/public/dist/mobile-app"));
app.use(express.static(__dirname + "/public/dist/smm-dashboard"));
app.use(express.static(__dirname + "/public/dist/mod-dashboard"));

//Vue app -----------------------
app.get(["/smm-dashboard", "/smm-dashboard/*"], (req, res) => {
  res.sendFile(path.join(__dirname, "/public/dist/smm-dashboard/index.html"));
});
//Js app ------------------------
app.get("/mod-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/dist/mod-dashboard/index.html"));
});
//Angular app -------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/dist/mobile-app/index.html"));
});

// catch 404
app.use((req, res, next) => {
  // log.error(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: "Not found" });
});

// catch errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.error || err.message;
  console.error(`Error ${status} (${msg}) on ${req.method} ${req.url}.`);
  res.status(status).send({ status, error: msg });
});

server.listen(PORT, () => {
  console.log(`Express Server started on Port ${app.get("port")} | Environment : ${app.get("env")}`);
  console.log(__dirname);
});

db.dbconnect();
module.exports = app;
