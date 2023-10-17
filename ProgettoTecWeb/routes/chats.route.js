const express = require("express");
const chats = require("../services/chats");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.get("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await chats.getChat(options);
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
  console.log("1");
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      message: req.body.message,
    };
    try {
      const result = await chats.sendDirectMessage(options);
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

module.exports = router;
