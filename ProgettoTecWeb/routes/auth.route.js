const express = require("express");
const auth = require("../services/auth");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();

router.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await auth.login({ username, password });
    if (result.status === 200 && result.data.token) {
      // Se l'autenticazione ha avuto successo e il token è presente nei dati
      // Imposta l'intestazione Authorization nella risposta
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
