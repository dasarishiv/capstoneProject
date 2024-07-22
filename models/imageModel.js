const mongooes = require("mongoose");
const imageSchema = new mongooes.Schema({
  name: String,
  dimentions: {
    w: {
      type: Number,
      required: [true, "Width required"]
    },
    h: {
      type: Number,
      required: [true, "Height required"]
    }
  },
  size: {
    type: Number,
    required: [true, "Size required"]
  },
  img: {
    data: Buffer,
    contentType: String
  },
  url: {
    type: String,
    required: [true, "Url required"]
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Image = mongooes.model("Image", imageSchema);
module.exports = Image;
