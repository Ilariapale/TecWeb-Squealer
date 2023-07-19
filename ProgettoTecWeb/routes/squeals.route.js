const express = require("express");
const squeals = require("../services/squeals");
const router = new express.Router();

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

module.exports = router;
