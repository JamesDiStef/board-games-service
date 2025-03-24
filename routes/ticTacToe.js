const express = require("express");
const router = express.Router();
const ticTacToe = require("../models/ticTacToe");

module.exports = router;

const initialState = {
  isGameOver: false,
  isPlayerOne: true,
  board: [],
};

router.get("/", async (req, res) => {
  try {
    const game = await ticTacToe.find();
    res.send(game);
  } catch {
    res.status(500).json({ message: "error getting users" });
  }
});

// router.get("/:id", async (req, res) => {
//   console.log(req.params.id);
//   try {
//     const game = await clue.find({
//       _id: req.params.id,
//     });
//     res.send(game);
//   } catch {
//     res.status(500).json({ message: "wow" });
//   }
// });

router.get("/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const currentGame = await ticTacToe.find({
      userId: req.params.userId,
    });
    res.send(currentGame);
  } catch {
    res.status(500).json({ message: "could not find game" });
  }
});

router.post("/:userId", async (req, res) => {
  console.log(req.params.userId);

  const currentGame = await ticTacToe.find({
    userId: req.params.userId,
  });

  console.log(currentGame);

  if (currentGame.length !== 0) {
    return res.status(404).json({ message: "Game already exists" });
  }

  let ng = new ticTacToe(initialState);
  ng.userId = req.params.userId;

  try {
    const newUser = await ng.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:userId", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const currentGame = await ticTacToe.findOne({
      userId: req.params.userId,
    });

    if (!currentGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (currentGame[key] !== undefined) {
        currentGame[key] = updates[key];
      }
    });

    const updatedGame = await currentGame.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
