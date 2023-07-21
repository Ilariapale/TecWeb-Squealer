const express = require("express");
const keywords = require("../services/keywords");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.post("/", async (req, res, next) => {
  let options = {};

  options.keywordInput = req.body;

  try {
    const result = await keywords.createKeyword(options);
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
    const result = await keywords.getKeyword(options);
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
    const result = await keywords.deleteKeyword(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

module.exports = router;
