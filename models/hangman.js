const mongoose = require("mongoose");

const hangmanSchema = new mongoose.Schema({
  userId: String,
  isWin: Boolean,
  wordToGuess: String,
  guessedLetters: [String],
  wrongGuesses: [String],
});

module.exports = mongoose.model("hangman", hangmanSchema);
