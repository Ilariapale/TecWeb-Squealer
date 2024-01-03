const express = require("express");
const comments = require("../services/comments");
const { verifyToken } = require("../services/utils");
const router = new express.Router();

router.get("/:identifier", verifyToken, async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
    user_id: req.user_id,
    last_comment_loaded: req.query.last_comment_loaded,
    is_token_valid: req.isTokenValid,
  };

  try {
    const result = await comments.getCommentSection(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

//identifier is the comment section id
router.post("/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      message: req.body.message,
    };
    try {
      const result = await comments.addComment(options);
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

//identifier is the comment id
router.delete("/section/:section_identifier/id/:identifier", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      section_identifier: req.params.section_identifier,
      user_id: req.user_id,
    };
    try {
      const result = await comments.deleteComment(options);
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
