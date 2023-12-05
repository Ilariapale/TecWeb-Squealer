const express = require("express");
const media = require("../services/media");
const router = new express.Router();
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = "" + Date.now() + "-" + file.originalname;
    cb(null, filename);
    req.filename = filename;
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    res.status(200).send({ name: req.filename });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

// http://localhost:8000/media/image/1701709870807-2023SkyDesktopAbyss.jpg
router.get("/image/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const filePath = path.join(__dirname, "../uploads/", name);
    res.setHeader("Content-Type", "image/jpg");
    console.log;
    res.sendFile(filePath);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

//http://localhost:8000/media/video/1701728495285-AT-cm_hlyCcbDLW6RyavYd83lGlw_COMPRESSO.mp4
router.get("/video/:name", (req, res) => {
  const videoPath = path.join(__dirname, "..", "uploads", req.params.name); // Path to your video file
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.delete("/delete-image/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "upload", imageName); // Assicurati di adattare il percorso

  // Verifica se il file esiste prima di eliminarlo
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
    res.status(200).json({ message: "Immagine eliminata con successo" });
  } else {
    res.status(404).json({ message: "L'immagine non esiste" });
  }
});
module.exports = router;
