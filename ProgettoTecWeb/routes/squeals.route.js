const express = require("express");
const squeals = require("../services/squeals");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();
router.get("/", verifyToken, async (req, res, next) => {
  //if user is not logged in, filter only official channels
  let options = {
    contentType: req.query.contentType,
    createdAfter: req.query.createdAfter,
    createdBefore: req.query.createdBefore,
    isScheduled: req.query.isScheduled,
    minReactions: req.query.minReactions,
    isInOfficialChannel: !req.isTokenValid || req.query.isInOfficialChannel,
  };

  try {
    const result = await squeals.getSqueals(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.get(["/:identifier", "/:user_identifier/squeal_hex"], verifyToken, async (req, res, next) => {
  //if user is not logged in, filter only official channels
  //TODO controllare che il doppio path sopra funzioni
  let options = {
    identifier: req.params.identifier,
    user_identifier: req.params.user_identifier,
    squeal_hex: req.params.squeal_hex,
    is_in_official_channel: !req.isTokenValid || req.query.isInOfficialChannel == "true",
  };

  try {
    const result = await squeals.getSqueal(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
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
    options.squealInput.sender_id = req.user_id;

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

router.patch("/:identifier/:reaction", verifyToken, async (req, res, next) => {
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

    options.updateSquealInlineReqJson = req.body;

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
