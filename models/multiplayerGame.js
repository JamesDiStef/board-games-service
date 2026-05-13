const mongoose = require("mongoose");

const multiplayerGameSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true },
  gameType: String,
  hostId: String,
  guestId: { type: String, default: null },
  board: [mongoose.Schema.Types.Mixed],
  currentTurn: String,
  isGameOver: { type: Boolean, default: false },
  winner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MultiplayerGame", multiplayerGameSchema);
