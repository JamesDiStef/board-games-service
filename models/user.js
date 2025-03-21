const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: String,
  clueId: String,
  ticTacId: String,
  connectFourId: String,
  hangmanId: String,
});

module.exports = mongoose.model("user", userSchema);
