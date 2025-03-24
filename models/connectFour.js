const mongoose = require("mongoose");

const connectFourSchema = new mongoose.Schema({
  userId: String,
  isGameOver: Boolean,
  isRedTurn: Boolean,
  column1: [{ id: Number, color: String }],
  column2: [{ id: Number, color: String }],
  column3: [{ id: Number, color: String }],
  column4: [{ id: Number, color: String }],
  column5: [{ id: Number, color: String }],
  column6: [{ id: Number, color: String }],
  column7: [{ id: Number, color: String }],
});

module.exports = mongoose.model("connectFour", connectFourSchema);
