const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    info: {
      type: String,
    },
    img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const ImageModel = mongoose.model("Image", imageSchema);

module.exports = ImageModel;
