const mongoose = require("mongoose");

const connectFourSchema = new mongoose.Schema({
  userId: String,
  isGameOver: Boolean,
  isRedTurn: Boolean,
  columns: [
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
    {
      counter: Number,
      squares: [
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
        { id: Number, color: String },
      ],
    },
  ],
});

module.exports = mongoose.model("connectFour", connectFourSchema);
