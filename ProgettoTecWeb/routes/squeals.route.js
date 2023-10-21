const express = require("express");
const squeals = require("../services/squeals");
const comments = require("../services/comments");
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
    is_in_official_channel: !req.isTokenValid || req.query.is_in_official_channel,
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

router.post("/", verifyToken, async (req, res) => {
  // Verifica la proprietà req.utenteLoggato per decidere come gestire la richiesta
  if (req.isTokenValid) {
    // Utente loggato, gestisci la richiesta come vuoi
    let options = {};
    options.squealInput = req.body;
    options.squealInput.user_id = req.user_id;

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

router.get("/home", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
      is_logged_in: req.isTokenValid,
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
    console.log(options);
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
