const express = require("express");
const chats = require("../services/chats");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.get("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
    };

    try {
      const result = await chats.getAllChatsPreview(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.get("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      last_loaded_message: req.query.last_loaded_message,
      user_id: req.user_id,
    };

    try {
      const result = await chats.getChatById(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.get("/direct/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await chats.getChatByUser(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.post("/direct/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      message: req.body.message,
    };
    try {
      const result = await chats.sendDirectMessage(options);

      const recipientSocketId = req.connectedUsers[options.identifier];
      //TODO se il destinatario non è online, invia una notifica push
      if (recipientSocketId) {
        req.io.to(recipientSocketId).emit("new_message", result.data);
      }

      res.status(result.status || 200).send(result.data);
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

module.exports = router;
