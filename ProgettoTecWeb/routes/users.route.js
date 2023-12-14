const express = require("express");
const users = require("../services/users");
const { verifyToken, jwt } = require("../services/utils");
const router = new express.Router();
const path = require("path");
const { stringify } = require("querystring");

//gives your username back if no identifier in query, otherwise gives back the username of the user with the given identifier
router.get("/username", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    const options = {
      user_id: req.user_id,
      identifier: req.query.identifier,
    };
    try {
      const result = await users.getUsername(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({ error: err || "Something went wrong." });
    }
  } else {
    res.status(401).send("Token is either missing invalid or expired");
  }
});

//users/notification
router.get("/notifications", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
      last_loaded: req.query.last_loaded,
      pag_size: req.query.pag_size,
    };
    try {
      const result = await users.getNotifications(options);
      res.status(result.status || 200).send(result.data);
    } catch (err) {
      return res.status(500).send({
        error: err || "Something went wrong.",
      });
    }
  } else {
    // Utente non loggato, invia una risposta di errore o reindirizza alla pagina di login
    res.status(401).send({ error: "Token is either missing invalid or expired" });
  }
});

//Token not required for creating an account
router.post("/", async (req, res, next) => {
  const options = { userInput: req.body };
  try {
    const result = await users.createUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({ error: err || "Something went wrong." });
  }
});

router.get("/", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      username: req.query.username,
      created_after: req.query.created_after,
      created_before: req.query.created_before,
      max_squeals: req.query.max_squeals,
      min_squeals: req.query.min_squeals,
      account_type: req.query.account_type,
      professional_type: req.query.professional_type,
      sort_order: req.query.sort_order,
      sort_by: req.query.sort_by,
      user_id: req.user_id,
      pag_size: req.query.pag_size,
      last_loaded: req.query.last_loaded,
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
    isTokenValid: req.isTokenValid,
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
//users/SMM?action=send&SMM_id=paulpaccy     action=[withdraw, send] SMM_id=[username, id]
router.patch("/SMM", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.query.SMM_id,
      user_id: req.user_id,
      action: req.query.action,
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
//users/SMM
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
//users/VIP?action=accept&VIP_id=paulpaccy
router.patch("/VIP", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.query.VIP_id,
      request_action: req.query.action,
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
//users/VIP
router.delete("/VIP", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.query.VIP_id,
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
//users/notifications?value=true   body:{notification_array: ["427618673", "427618674"]]}
router.patch("/notifications", verifyToken, async (req, res, next) => {
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
//users/paulpaccy/type   body: {account_type:"professional", professional_type:"SMM"}

router.patch("/characters", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      user_id: req.user_id,
      inlineReqJson: req.body,
    };

    try {
      const result = await users.addCharacters(options);
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
//users/paulpaccy/profile   body: {profile_info: "Hey there, I'm Paul!", profile_picture: "TODO"}
router.patch("/:identifier/profile", verifyToken, async (req, res, next) => {
  if (req.isTokenValid) {
    let options = {
      identifier: req.params.identifier,
      user_id: req.user_id,
    };

    options.inlineReqJson = req.body;
    console.log(options);
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
//users/paulpaccy/password   body: {old_password: "123456", new_password: "1234567"}
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

router.patch("/:identifier/reset-password", async (req, res, next) => {
  let options = {
    identifier: req.params.identifier,
    user_id: req.user_id,
  };

  options.inlineReqJson = req.body;

  try {
    const result = await users.resetPassword(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

//users/username/banstatus?value=true
router.patch("/:identifier/ban-status", verifyToken, async (req, res, next) => {
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

module.exports = router;
