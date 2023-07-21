const express = require("express");
const channels = require("../services/channels");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.get("/", async (req, res, next) => {
  let options = {
    name: req.query.name,
    createdAfter: req.query.createdAfter,
    createdBefore: req.query.createdBefore,
    isOfficial: req.query.isOfficial,
  };

  try {
    const result = await channels.getChannels(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.post("/", async (req, res, next) => {
  let options = {};

  options.channelInput = req.body;

  try {
    const result = await channels.createChannel(options);
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
    const result = await channels.getChannel(options);
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
    const result = await channels.deleteChannel(options);
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

  options.updateChannelInlineReqJson = req.body;

  try {
    const result = await channels.updateChannel(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

module.exports = router;
