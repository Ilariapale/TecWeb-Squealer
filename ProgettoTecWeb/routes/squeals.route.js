const express = require("express");
const squeals = require("../services/squeals");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();
router.get("/official", async (req, res, next) => {
  //TODO squeal di canali ufficiali
  let options = {
    contentType: req.query.contentType,
    createdAfter: req.query.createdAfter,
    createdBefore: req.query.createdBefore,
    isScheduled: req.query.isScheduled,
    minReactions: req.query.minReactions,
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

router.get("/official/:identifier", async (req, res, next) => {
  //TODO squeal di canali ufficiali
  let options = {
    identifier: req.params.identifier,
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

//^^^ ---------------- NO AUTH ---------------- ^^^
router.use(verifyToken);
//vvv ----------------- AUTH ------------------ vvv

router.get("/", async (req, res, next) => {
  let options = {
    contentType: req.query.contentType,
    createdAfter: req.query.createdAfter,
    createdBefore: req.query.createdBefore,
    isScheduled: req.query.isScheduled,
    minReactions: req.query.minReactions,
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

router.get("/:identifier", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
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

router.post("/", async (req, res, next) => {
  let options = {};

  options.squealInput = req.body;

  try {
    const result = await squeals.createSqueal(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.delete("/:identifier", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
  };

  try {
    const result = await squeals.deleteSqueal(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.patch("/:identifier/:reaction", async (req, res, next) => {
  //TODO reaction
  let options = {
    identifier: req.params.identifier,
    reaction: req.params.reaction,
  };

  options.squealInput = req.body;

  try {
    const result = await squeals.reactSqueal(options);
    //TODO reactSqual
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.patch("/:identifier", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
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
});

router.patch("/:identifier/reactions", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
  };

  options.updateSquealReactionsReqJson = req.body;

  try {
    const result = await squeals.updateSquealReactions(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

module.exports = router;
