const express = require("express");
const keywords = require("../services/keywords");
const { verifyToken } = require("../services/utils");
const router = new express.Router();

router.get("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
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
  } else {
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

router.post("/", verifyToken, async (req, res, next) => {
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

router.delete("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await keywords.deleteKeyword(options);
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
