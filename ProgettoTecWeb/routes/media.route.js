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

router.get("/:name", async (req, res) => {
  const name = req.params.name;
  try {
    res.setHeader("Content-Type", "video/mp4");
    const filePath = path.join(__dirname, "..", "uploads", name);

    // Utilizza la funzione fs.createReadStream per inviare il file in modo asincrono
    const fileStream = fs.createReadStream(filePath);

    // Gestisci gli errori durante la lettura del file
    fileStream.on("error", (err) => {
      console.error("Errore nella lettura del file:", err);
      return res.status(500).send({
        error: "Something went wrong while reading the file.",
        details: err.message,
      });
    });

    // Invia il file come risposta
    fileStream.pipe(res);

    // Aggiungi un listener per gestire l'evento di chiusura della risposta
    fileStream.on("close", () => {
      console.log("File inviato con successo:", filePath);
      // Chiudi la risposta solo quando il file è completamente inviato
      res.end();
    });
  } catch (err) {
    console.error("Errore:", err);
    return res.status(500).send({
      error: err || "Something went wrong.",
    });
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
