//TODO immagini

const express = require("express"),
  cookieParser = require("cookie-parser"),
  db = require("./db"),
  log = require("morgan"),
  path = require("path"),
  cors = require("cors"),
  multer = require("multer"),
  upload = multer(),
  http = require("http"), // Aggiungi questa linea
  socketIo = require("socket.io"), // Aggiungi questa linea
  app = express(),
  PORT = process.env.PORT || 8000,
  NODE_ENV = process.env.NODE_ENV || "development";
const server = http.createServer(app); // Aggiungi questa linea
const io = socketIo(server); // Aggiungi questa linea
const connectedUsers = {};

app.set("port", PORT);
app.set("env", NODE_ENV);

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable("trust proxy");
io.on("connect", (socket) => {
  // Ricevi l'identificativo dell'utente quando si connette
  socket.on("authenticate", (userId) => {
    // Associa l'identificativo dell'utente al suo socket.id
    connectedUsers[userId] = socket.id;
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
app.use(log("tiny"));

// parse application/json
app.use(express.json());

// parse raw text
app.use(express.text());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// parse multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

// Aggiungi il gestore per i WebSocket
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});
//app.use(cookieParser());
require("./routes")(app);

//Angular app -------------------
console.log("dirname: " + __dirname);
app.use(express.static(__dirname + "/public/dist/mobile-app"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/dist/mobile-app/index.html"));
});
//End angular app ---------------

// catch 404
app.use((req, res, next) => {
  // log.error(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: "Not found" });
});

// catch errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.error || err.message;
  console.error(`Error ${status} (${msg}) on ${req.method} ${req.url} with payload ${req.body}.`);
  res.status(status).send({ status, error: msg });
});

module.exports = app;

server.listen(PORT, () => {
  console.log(`Express Server started on Port ${app.get("port")} | Environment : ${app.get("env")}`);
  console.log("" + __dirname + "/src/MobileApp");
});

db.dbconnect();
