const express = require("express");
const squeals = require("../services/squeals");
const comments = require("../services/comments");
const { scheduleSqueals } = require("../services/schedule_utils");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.get("/", verifyToken, async (req, res, next) => {
  //if user is not logged in, filter only official channels
  let options = {
    content_type: req.query.content_type,
    created_after: req.query.created_after,
    created_before: req.query.created_before,
    is_scheduled: req.query.is_scheduled,
    min_reactions: req.query.min_reactions,
    min_balance: req.query.min_balance,
    max_balance: req.query.max_balance,
    sort_order: req.query.sort_order,
    sort_by: req.query.sort_by,
    pag_size: req.query.pag_size,
    last_loaded: req.query.last_loaded,
    keywords: req.query.keywords,
    is_in_official_channel: !req.isTokenValid || req.query.is_in_official_channel,
    user_id: req.user_id,
  };

  try {
    const result = await squeals.getSqueals(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.get("/prices", async (req, res, next) => {
  try {
    const result = squeals.getPrices();
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    // Utente loggato, gestisci la richiesta come vuoi
    let options = {
      user_id: req.user_id,
      content: req.body["content"],
      content_type: req.body.content_type,
      is_scheduled: false,
      recipients: req.body.recipients,
      vip_id: req.body.vip_id,
    };

    try {
      const result = await squeals.createSqueal(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    // Utente non loggato, invia una risposta di errore o reindirizza alla pagina di login
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.post("/scheduled", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    try {
      //user_id = nome utente
      let options = {
        user_id: req.user_id,
        content: req.body["content"],
        content_type: req.body.content_type,
        is_scheduled: true,
        recipients: req.body.recipients,
        connected_users: req.connectedUsers,
        io: req.io,
      };

      const input = {
        schedule_type: req.body.schedule_type,
        tick_rate: req.body.tick_rate,
        scheduled_date: req.body.scheduled_date,
        repeat: req.body.repeat,
      };
      const result = await scheduleSqueals(input, options);
      if (result.status >= 300) {
        return res.status(result.status).send({ error: result.message });
      }
      res.status(result.status || 200).send({ message: result.message });
    } catch (err) {
      console.error("Error creating cron job:", err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.get("/home", verifyToken, async (req, res, next) => {
  let options = {
    user_id: req.user_id,
    is_logged_in: req.isTokenValid,
    token_error: req.tokenError || "",
    last_loaded: req.query.last_loaded,
    pag_size: req.query.pag_size,
  };
  try {
    const result = await squeals.getHomeSqueals(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.get("/reported", verifyToken, async (req, res, next) => {
  let options = {
    user_id: req.user_id,
    checked: req.query.checked,
    last_loaded: req.query.last_loaded,
    pag_size: req.query.pag_size,
    sort_by: req.query.sort_by,
    sort_order: req.query.sort_order,
  };
  try {
    const result = await squeals.getReportedSqueals(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

//squeals/3284612219837
//squeals/user_id/1928731293711/hex/23
router.get(["/:identifier", "/user_id/:user_identifier/hex/:squeal_hex"], verifyToken, async (req, res, next) => {
  //if user is not logged in, filter only official channels
  let options = {
    identifier: req.params.identifier,
    user_identifier: req.params.user_identifier,
    squeal_hex: req.params.squeal_hex,
    is_in_official_channel: !req.isTokenValid || req.query.is_in_official_channel == "true",
    user_id: req.user_id,
    is_token_valid: req.isTokenValid,
  };
  try {
    if (!["true", "false", undefined].includes(req.query.is_in_official_channel)) {
      res.status(400).send({ error: `is_in_official_channel must be either "true" or "false"` });
    } else {
      const result = await squeals.getSqueal(options);
      res.status(result.status || 200).send(result.data);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
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
      const result = await squeals.deleteSqueal(options);
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

router.patch("/checked/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await squeals.markAsChecked(options);
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

router.patch("/report/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await squeals.reportSqueal(options);
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

router.patch("/:identifier/reaction/:reaction", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      reaction: req.params.reaction,
      user_id: req.user_id,
    };

    try {
      const result = await squeals.addReaction(options);
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

router.patch("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.inlineReqJson = req.body;

    try {
      const result = await squeals.updateSqueal(options);
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
