const express = require("express");
const router = express.Router();
const user = require("../models/user");
const { params } = require("firebase-functions");
const {
  onNewAnrIssuePublished,
} = require("firebase-functions/v2/alerts/crashlytics");

module.exports = router;

const initialState = {
  userId: "",
  clueId: "",
  ticTacId: "",
  connectFourId: "",
  hangmanId: "",
};

router.get("/", async (req, res) => {
  try {
    const users = await user.find();
    res.send(users);
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
    const currentUser = await user.find({
      userId: req.params.userId,
    });
    res.send(currentUser);
  } catch {
    res.status(500).json({ message: "could not find user" });
  }
});

router.post("/:userId", async (req, res) => {
  console.log(req.params.userId);

  const currentUser = await user.find({
    userId: req.params.userId,
  });

  console.log(currentUser);

  if (currentUser.length !== 0) {
    return res.status(404).json({ message: "User already exists" });
  }

  let nu = new user(initialState);
  nu.userId = req.params.userId;

  console.log(onNewAnrIssuePublished);

  try {
    const newUser = await nu.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const currentUser = await user.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "Game not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (currentUser[key] !== undefined) {
        currentUser[key] = updates[key];
      }
    });

    const updatedGame = await currentUser.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
