const express = require("express");
const users = require("../services/users");
const router = new express.Router();
const path = require("path");
const { stringify } = require("querystring");

/*
 try {
   const result = await users.getUserList(options);
   if (req.headers.accept.includes("text/html")) {
     // Invia una pagina HTML come risposta
     console.log("if");
     res.status(result.status || 200).sendFile(path.join(__dirname, "..", "test.html"));
   } else {
     console.log("else");
     // Invia un oggetto JSON come risposta
     res.status(result.status || 200).json(result.data);
   }

   const result = await users.getUserList(options);
   res.status(result.status || 200).send(result.data);
 } catch (err) {
   return res.status(500).send({
     error: err || "Something went wrong.",
   });
 }
*/
router.get("/", async (req, res, next) => {
  let options = {
    createdAfter: req.query.createdAfter,
    createdBefore: req.query.createdBefore,
    maxSquealsCount: req.query.maxSquealsCount,
    minSquealsCount: req.query.minSquealsCount,
  };

  try {
    const result = await users.getUserList(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.post("/", async (req, res, next) => {
  // Crea un oggetto `options` con i dati
  const options = { userInput: req.body };
  try {
    // Esegue la chiamata all'API `users.createUser`
    const result = await users.createUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    // Registra l'errore
    console.error(err);
    return res.status(500).send(err.message);
  }
});

router.get("/:identifier", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
  };

  try {
    const result = await users.getUser(options);
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
    const result = await users.deleteUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.patch("/:identifier", async (req, res, next) => {
  console.log("PATCH " + req.params.identifier);
  let options = {
    identifier: req.params.identifier,
  };

  options.updateProfileInlineReqJson = req.body;

  try {
    const result = await users.updateProfile(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

module.exports = router;
