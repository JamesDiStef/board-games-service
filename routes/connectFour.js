const express = require("express");
const router = express.Router();
const connectFour = require("../models/connectFour");

module.exports = router;

const initialState = {
  isGameOver: false,
  isRedTurn: true,
  columns: [
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
    {
      counter: 5,
      squares: [
        { id: 0, color: "" },
        { id: 1, color: "" },
        { id: 2, color: "" },
        { id: 3, color: "" },
        { id: 4, color: "" },
        { id: 5, color: "" },
      ],
    },
  ],
};

router.get("/", async (req, res) => {
  try {
    const game = await connectFour.find();
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
    const currentGame = await connectFour.find({
      userId: req.params.userId,
    });
    res.send(currentGame);
  } catch {
    res.status(500).json({ message: "could not find game" });
  }
});

router.post("/:userId", async (req, res) => {
  console.log(req.params.userId);

  const currentGame = await connectFour.find({
    userId: req.params.userId,
  });

  console.log(currentGame);

  if (currentGame.length !== 0) {
    return res.status(404).json({ message: "Game already exists" });
  }

  let ng = new connectFour(initialState);
  ng.userId = req.params.userId;

  try {
    const newGame = await ng.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:userId", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const currentGame = await connectFour.findOne({
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
