const mongoose = require("mongoose");
//const { Media } = require("./schemas");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
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
};
