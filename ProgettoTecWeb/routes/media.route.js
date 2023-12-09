const express = require("express");
const media = require("../services/media");
const router = new express.Router();
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { checkChar, verifyToken } = require("../services/utils");

//TODO fare in modo che se non hai abbastanza caratteri per postare la foto, non la posti oppure viene eliminata
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("__dirname: " + __dirname);
    console.log(path.join(__dirname, "../uploads/image"));
    if (file.mimetype.includes("image")) {
      cb(null, path.join(__dirname, "../uploads/image"));
    } else if (file.mimetype.includes("video")) {
      cb(null, path.join(__dirname, "../uploads/video"));
    } else {
      cb(null, path.join(__dirname, "../uploads"));
    } // server/routes
    //(ENOENT: no such file or directory, open 'uploads/image/1702061662793-2023SkyDesktopAbyss.jpg')
  },
  filename: (req, file, cb) => {
    console.log("filename");
    const filename = "" + Date.now() + "-" + file.originalname;
    console.log(filename);
    cb(null, filename);
    console.log("cb(null, filename);");
    req.filename = filename;
    console.log("req.filename = filename");
    req.mimetype = file.mimetype;
    console.log("req.mimetype = file.mimetype");
  },
});

const upload = multer({ storage: storage });

router.post("/upload/image", verifyToken, media.setImageInReq, checkChar, upload.single("image"), async (req, res) => {
  try {
    console.log("upload image");
    if (!req.isTokenValid) return res.status(401).send({ error: "Unauthorized" });
    if (!req.hasEnough) return res.status(400).send({ error: "Not enough characters" });
    if (!req.mimetype.includes("image")) {
      return res.status(400).send({
        error: "File not valid",
      });
    }

    res.status(200).send({ name: req.filename });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.post("/upload/video", verifyToken, media.setVideoInReq, checkChar, upload.single("video"), async (req, res) => {
  try {
    if (!req.mimetype.includes("video")) {
      return res.status(400).send({
        error: "File not valid",
      });
    }
    const videoPath = path.join(__dirname, "..", "uploads", "video", req.filename);
    const thumbnailsDir = path.join(__dirname, "..", "uploads", "video-thumbnails");
    const videoName = path.parse(req.filename).name;
    const thumbnailPath = path.join(thumbnailsDir, videoName + "-thumbnail.png");

    await media.generateThumbnail(videoPath, thumbnailsDir, (err) => {
      if (err) {
        console.error("An error occurred:", err);
      } else {
        console.log("Done! ", thumbnailPath);
      }
    });

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
    const filePath = path.join(__dirname, "..", "uploads", "image", name);
    res.setHeader("Content-Type", "image/jpg");
    res.sendFile(filePath);
  } catch (err) {
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

//http://localhost:8000/media/video/1701728495285-AT-cm_hlyCcbDLW6RyavYd83lGlw_COMPRESSO.mp4
router.get("/video/:name", async (req, res) => {
  const videoPath = path.join(__dirname, "..", "uploads", "video", req.params.name);
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

router.get("/thumbnail/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const videoName = path.parse(name).name;
    const thumbnailPath = path.join(__dirname, "..", "uploads", "video-thumbnails", videoName + "-thumbnail.png");

    res.setHeader("Content-Type", "image/png");

    if (fs.existsSync(thumbnailPath)) {
      res.sendFile(thumbnailPath);
    } else {
      //errore, non esiste
      return res.status(500).send({
        error: "Thumbnail non trovata",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
  }
});

router.delete("/delete-image/:imageName", (req, res) => {
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
