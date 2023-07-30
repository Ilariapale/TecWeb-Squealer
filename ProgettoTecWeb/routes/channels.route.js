const express = require("express");
const channels = require("../services/channels");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

//TODO funzione per silenziare e riattivare un canale (fatto)
//TODO funzione per iscrivermi e disiscrivermi un canale (fatto)

router.get("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      name: req.query.name,
      createdAfter: req.query.createdAfter,
      createdBefore: req.query.createdBefore,
      is_official: req.query.is_official,
    };

    try {
      const result = await channels.getChannels(options);
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
  let options = {
    identifier: req.params.identifier,
    isTokenValid: req.isTokenValid,
    user_id: req.user_id,
  };

  try {
    const result = await channels.getChannel(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {};
    options.channelInput = req.body;
    options.channelInput.user = req.user_id;
    try {
      const result = await channels.createChannel(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    return res.status(401).send({
      error: "Token is either missing invalid or expired",
    });
  }
});

router.delete("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user: req.user_id,
    };

    try {
      const result = await channels.deleteChannel(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    return res.status(401).send({
      error: "Token is either missing invalid or expired",
    });
  }
});

router.patch("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
    };

    options.updateChannelInlineReqJson = req.body;

    try {
      const result = await channels.updateChannel(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    return res.status(401).send({
      error: "Token is either missing invalid or expired",
    });
  }
});

router.patch("/:identifier/blockedstatus", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };
    try {
      const result = await users.toggleChannelBlockedStatus(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});
module.exports = router;

router.patch("/:identifier/subscription", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };
    try {
      const result = await channels.toggleChannelSubscription(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/muted", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };
    try {
      const result = await channels.toggleChannelMuteStatus(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});
