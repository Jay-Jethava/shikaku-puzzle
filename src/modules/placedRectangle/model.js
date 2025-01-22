const mongoose = require("mongoose");

const PlacedRectangleSchema = new mongoose.Schema({
  id: String,
  gameId: Number,
  width: Number,
  height: Number,
  position: {
    x: Number,
    y: Number,
  },
  matchingRectangleId: String,
});

const PlacedRectangle = mongoose.model(
  "PlacedRectangle",
  PlacedRectangleSchema
);
module.exports = PlacedRectangle;
