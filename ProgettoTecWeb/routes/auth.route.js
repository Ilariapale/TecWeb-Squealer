const express = require("express");
const auth = require("../services/auth");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await auth.login({ username, password });
    res.status(result.status).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

module.exports = router;
