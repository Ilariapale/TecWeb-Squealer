const express = require("express");
const users = require("../services/users");
const { verifyToken, jwt } = require("../services/utils");
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

//Token not required for creating an account
router.post("/", async (req, res, next) => {
  const options = { userInput: req.body };
  try {
    const result = await users.createUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

router.get("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      createdAfter: req.query.createdAfter,
      createdBefore: req.query.createdBefore,
      maxSquealsCount: req.query.maxSquealsCount,
      minSquealsCount: req.query.minSquealsCount,
      user_id: req.user_id,
    };

    try {
      const result = await users.getUserList(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.get("/:identifier", verifyToken, async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
    user_id: req.user_id,
  };
  // res.cookie("username", "john_doe");
  // console.log(req);
  try {
    const result = await users.getUser(options);
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
      const result = await users.deleteUser(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/profile", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
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
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/password", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.updateProfileInlineReqJson = req.body;

    try {
      const result = await users.updatePassword(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/password", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.updateProfileInlineReqJson = req.body;

    try {
      const result = await users.updatePassword(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/activestatus", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.updateProfileInlineReqJson = req.body;

    try {
      const result = await users.toggleProfileActiveStatus(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});
module.exports = router;
