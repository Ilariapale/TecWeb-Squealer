const mongoose = require("mongoose");
//const { Media } = require("./schemas");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

const uploadsPath = path.join(__dirname, "../uploads");
module.exports = {
  generateThumbnail: async (videoPath, outputPath, callback) => {
    const videoName = path.parse(videoPath).name; // Ottieni il nome del video senza l'estensione
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    ffmpeg(videoPath)
      .on("end", () => {
        const thumbnailName = `${videoName}-thumbnail.png`; // Nome del file thumbnail
        console.log("Thumbnail generata con successo!");
        callback(null, thumbnailName);
      })
      .on("error", (err) => {
        console.error("Errore durante la generazione della thumbnail:", err);
        callback(err);
      })
      .screenshots({
        count: 1,
        folder: outputPath,
        size: "320x?",
        filename: `${videoName}-thumbnail.png`, // Il nome reale verrà sostituito dalla riga precedente
      });
  },

  removeMedia: async (mediaName, type) => {
    try {
      let mediaPath;
      if (type === "video") {
        const thumbnailName = mediaName.replace(".mp4", "-thumbnail.png");
        const thumbnailPath = path.join(uploadsPath, "video-thumbnails", thumbnailName);
        mediaPath = path.join(uploadsPath, "video", mediaName);
        fs.unlink(thumbnailPath, (err) => {
          if (err) {
            console.error("Errore durante la rimozione della thumbnail:", err);
          } else {
            console.log("Thumbnail rimossa con successo!");
          }
        });
      } else if (type === "image") {
        mediaPath = path.join(uploadsPath, "image", mediaName);
      }
      fs.unlink(mediaPath, (err) => {
        if (err) {
          console.error("Errore durante la rimozione del file:", err);
        } else {
          console.log("File rimosso con successo!");
        }
      });
    } catch (err) {
      console.error(err);
    }
  },

  setImageInReq(req, res, next) {
    req.mediaType = "image";
    next();
  },

  setVideoInReq(req, res, next) {
    req.mediaType = "video";
    next();
  },
};
//D:\Programmazione\Git\TecWeb-Squealer\ProgettoTecWeb\uploads\video-thumbnails\1701775366848-document_5999096777297367672-thumbnail.png
//D:\Programmazione\Git\TecWeb-Squealer\ProgettoTecWeb\uploads\thumbnails\\1701775366848-document_5999096777297367672-thumbnail.png
