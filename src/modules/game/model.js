const mongoose = require("mongoose");

const RectangleSchema = new mongoose.Schema({
  id: String,
  width: Number,
  height: Number,
  area: Number,
  isPlaced: Boolean,
  position: {
    x: Number,
    y: Number,
  },
});

const GameSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  width: Number,
  height: Number,
  board: [[Number]],
  rectangles: [RectangleSchema],
  startTime: Number,
  isComplete: { type: Boolean, default: false },
  completionTime: Number,
});

const Game = mongoose.model("Game", GameSchema);
module.exports = Game;
