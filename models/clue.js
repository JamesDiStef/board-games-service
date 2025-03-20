const mongoose = require("mongoose");

const clueStateSchema = new mongoose.Schema({
  characters: [String],
  weapons: [String],
  isGameOver: Boolean,
  eliminatedPeople: [String],
  eliminatedWeapons: [String],
  eliminatedRooms: [String],
  isOpenModal: Boolean,
  player: {
    name: String,
    roomId: Number,
  },
  playerName: String,
  currentRoom: String,
  board: [{ id: Number, type: String }],
  isOpenResponseModal: Boolean,
  thingToReveal: String,
  guesses: {
    person: String,
    weapon: String,
    room: String,
  },
  confidential: {
    person: String,
    weapon: String,
    room: String,
  },
});

module.exports = mongoose.model("clue", clueStateSchema);
