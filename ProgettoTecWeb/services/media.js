const mongoose = require("mongoose");
const { Media } = require("./schemas");

module.exports = {
  uploadImage: async (options) => {
    const { date, name, contentType } = options;
    // Salva l'immagine nel database
    const newMedia = new Media({
      original_name: name,
      name: date + "-" + name,
      date: date,
      content_type: contentType,
    });
    await newMedia.save();
    return {
      status: 201,
      data: "Image saved successfully in the database.",
    };
  },
};
