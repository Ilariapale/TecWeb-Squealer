const express = require("express");
const channels = require("../services/channels");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.get("/", verifyToken, async (req, res, next) => {
  //if (req.isTokenValid) {
  let options = {
    name: req.query.name,
    created_after: req.query.created_after,
    created_before: req.query.created_before,
    is_official: !req.isTokenValid || req.query.is_official === "true",
    min_subscribers: req.query.min_subscribers,
    max_subscribers: req.query.max_subscribers,
    min_squeals: req.query.min_squeals,
    max_squeals: req.query.max_squeals,
    sort_by: req.query.sort_by,
    sort_order: req.query.sort_order,
    user_id: req.user_id,
    pag_size: req.query.pag_size,
    last_loaded: req.query.last_loaded,
    is_token_valid: req.isTokenValid,
  };

  try {
    const result = await channels.getChannels(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
  // } else {
  //   res.status(401).send({ error: "Token is either missing invalid or expired" });
  // }
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

router.get("/:identifier/subscription-status", verifyToken, async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
    isTokenValid: req.isTokenValid,
    user_id: req.user_id,
  };

  try {
    const result = await channels.getChannelSubscriptionStatus(options);
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
    options.channelInput.user_id = req.user_id;
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
      user_id: req.user_id,
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
      user_id: req.user_id,
    };

    options.inlineReqJson = req.body;

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

router.patch("/:identifier/editor", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await channels.leaveModTeam(options);
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

router.patch("/:identifier/blocked-status", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      value: req.query.value,
    };

    try {
      const result = await channels.channelBlockedStatus(options);
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

router.patch("/:identifier/subscription-status", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      value: req.query.value,
    };
    try {
      const result = await channels.channelSubscription(options);
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

router.patch("/:identifier/muted-status", verifyToken, async (req, res, next) => {
  console.log("err");

  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      value: req.query.value,
      user_id: req.user_id,
    };
    try {
      const result = await channels.channelMuteStatus(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/:squeal_identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      squealIdentifier: req.params.squeal_identifier,
      user_id: req.user_id,
    };
    try {
      const result = await channels.removeSquealFromChannel(options);
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

module.exports = router;
