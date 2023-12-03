const express = require("express");
const media = require("../services/media");
const router = new express.Router();
const app = express();
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  const date = Date.now();
  const options = {
    date: date,
    name: req.file.originalname,
    contentType: req.file.mimetype,
  };
  try {
    const result = await media.uploadImage(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});
module.exports = router;
