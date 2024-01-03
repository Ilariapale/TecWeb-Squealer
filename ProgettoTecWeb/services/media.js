const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

const uploadsPath = path.join(__dirname, "../uploads");
module.exports = {
  generateThumbnail: async (videoPath, outputPath, callback) => {
    const videoName = path.parse(videoPath).name; // Get the video name without the extension
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    ffmpeg(videoPath)
      .on("end", () => {
        const thumbnailName = `${videoName}-thumbnail.png`; // Thumbnail file name
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
        filename: `${videoName}-thumbnail.png`, // The real name will be replaced by the previous line
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
            console.error("Error while removing thumbnail:", err);
          } else {
            //console.log("Thumbnail removed succesfully!");
          }
        });
      } else if (type === "image") {
        mediaPath = path.join(uploadsPath, "image", mediaName);
      }
      fs.unlink(mediaPath, (err) => {
        if (err) {
          console.error("Error while removing file:", err);
        } else {
          //console.log("File removed succesfully!");
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
