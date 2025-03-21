const mongoose = require("mongoose");

const ticTacToeSchema = new mongoose.Schema({
  userId: String,
  isGameOver: Boolean,
  isPlayerOne: Boolean,
  board: [{ id: Number, value: String }],
});

module.exports = mongoose.model("ticTackToe", ticTacToeSchema);
