const express = require("express");
const auth = require("../services/auth");
const router = new express.Router();

router.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await auth.login({ username, password });
    if (result.status === 200 && result.data.token) {
      // If authentication was successful and token is present in data
      // Set Authorization header in response
      res.setHeader("Authorization", `Bearer ${result.data.token}`);
      res.status(result.status).send(result.data);
    } else {
      res.status(result.status).send(result.data);
    }
  } catch (err) {
    return res.status(500).send({ error: err || "Something went wrong." });
  }
});

//auth/guest?uuid=123456789
router.post("/guest", async (req, res, next) => {
  try {
    let optons = {
      uuid: req.query.uuid,
    };
    const result = await auth.login_guest(optons);
    if (result.status === 200 && result.data.token) {
      // If authentication was successful and token is present in data
      // Set Authorization header in response
      res.setHeader("Authorization", `Bearer ${result.data.token}`);
      res.status(result.status).send(result.data);
    } else {
      res.status(result.status).send(result.data);
    }
  } catch (err) {
    return res.status(500).send({ error: err || "Something went wrong." });
  }
});

module.exports = router;
