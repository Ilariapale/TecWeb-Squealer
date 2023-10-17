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
      created_after: req.query.created_after,
      created_before: req.query.created_before,
      max_squeals: req.query.max_squeals,
      min_squeals: req.query.min_squeals,
      account_type: req.query.account_type,
      professional_type: req.query.professional_type,
      sort_order: req.query.sort_order,
      sort_by: req.query.sort_by,
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

router.delete("/SMM", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
    };

    try {
      const result = await users.removeSMM(options);
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

router.delete("/VIP", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
    };

    try {
      const result = await users.removeVIP(options);
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

router.patch("/:identifier/type", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.inlineReqJson = req.body;

    try {
      const result = await users.updateUser(options);
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

router.post("/:identifier/SMMRequest", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    try {
      const result = await users.requestSMM(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

//es. http://ijdoai.com/user/username/requestHandler?response=accept
router.patch("/:identifier/requestHandler", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      request_response: req.query.response,
      user_id: req.user_id,
    };

    try {
      const result = await users.handleVIPRequest(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/:identifier/managedAccountRequestHandler", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      request_response: req.query.response,
      user_id: req.user_id,
    };

    try {
      const result = await users.handleManagedAccountRequest(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

router.patch("/smm", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
    };

    options.inlineReqJson = req.body;

    try {
      const result = await users.updateSMM(options);
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

    options.inlineReqJson = req.body;

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

    options.inlineReqJson = req.body;

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

//es. http://ijdoai.com/user/username/banstatus?value=true
router.patch("/:identifier/banstatus", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
      ban_status: req.query.value,
    };

    try {
      const result = await users.userBanStatus(options);
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

router.patch("/notification", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
      value: req.query.value,
    };

    options.inlineReqJson = req.body;

    try {
      const result = await users.setNotificationStatus(options);
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
