"use strict";
/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */
global.rootDir = __dirname;
global.startDate = null;

const mg = require(global.rootDir + "/scripts/mongo.js");
const express = require("express");
const cors = require("cors");

//routes
const user = require("./routes/User.js");
const channel = require("./routes/Channel.js");

const path = require("path");

const mobileApp = path.join(__dirname, "public", "dist", "mobile-app", "index.html");
/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

let app = express();
/*app.use('/app', express.static(global.rootDir +'/public/AppSite/src'));*/

app.use(express.static(path.join(__dirname, "public", "dist", "mobile-app"))); // = D:\Programmazione\Git\TecWeb-Squealer\Progetto\public\dist\mobile-app
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/user", user);
app.use("/channel", channel);

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable("trust proxy");

const routes = ["/login", "/home", "/signup", "/map"];

routes.forEach((route) => {
  app.get(route, (req, res) => {
    res.sendFile(mobileApp);
  });
});
/*
app.get("/login", (req, res) => res.sendFile(mobileApp));
app.get("/home", (req, res) => res.sendFile(mobileApp));
app.get("/signup", (req, res) => res.sendFile(mobileApp));
*/
app.get("*", (req, res) => res.sendFile("index.html"));

/* ========================== */
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */

app.listen(8000, function () {
  global.startDate = new Date();
  console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}`);
});

/*       END OF SCRIPT        */
