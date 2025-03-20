const express = require("express");
const router = express.Router();
const clue = require("../models/clue");

module.exports = router;

const characters = [
  "Professor Plum",
  "Colonel Mustard",
  "Ms. Peacock",
  "Ms. Scarlett",
  "Mrs. White",
  "Mr. Green",
];

const weapons = [
  "Candlestick",
  "Lead Pipe",
  "Revolver",
  "Wrench",
  "Rope",
  "Dagger",
];

const board = [
  { id: 0, type: "Study" },
  { id: 1, type: "Library" },
  { id: 2, type: "Dining Room" },
  { id: 3, type: "Kitchen" },
  { id: 4, type: "Pool Room" },
  { id: 5, type: "Bedroom" },
  { id: 6, type: "Walk in Closet" },
  { id: 7, type: "Hall" },
  { id: 8, type: "Billiards Room" },
  { id: 9, type: "Secret Lab" },
  { id: 10, type: "Storage Room" },
  { id: 11, type: "Ballroom" },
  { id: 12, type: "Bathroom" },
  { id: 13, type: "Conservatory" },
  { id: 14, type: "Lounge" },
  { id: 15, type: "Attic" },
];

const initialState = {
  playerName: "",
  characters: characters,
  weapons: weapons,
  isGameOver: false,
  eliminatedPeople: "",
  eliminatedWeapons: "",
  eliminatedRooms: "",
  isOpenModal: false,
  player: {
    name: "test guy",
    roomId: 0,
  },
  currentRoom: "study",
  board: "",
  isOpenResponseModal: false,
  thingToReveal: "",
  guesses: {
    person: "",
    weapon: "",
    room: "",
  },
  confidential: {
    person: characters[Math.floor(Math.random() * 6)],
    weapon: weapons[Math.floor(Math.random() * 6)],
    room: board[Math.floor(Math.random() * 6)].type,
  },
};

router.get("/", async (req, res) => {
  console.log("got here");
  try {
    const items = await clue.find();
    console.log(items);
    res.send(items);
  } catch {
    res.status(500).json({ message: "wow" });
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

router.get("/:playerName", async (req, res) => {
  console.log(req.params.playerName);
  try {
    const game = await clue.find({
      playerName: req.params.playerName,
    });
    res.send(game);
  } catch {
    res.status(500).json({ message: "wow" });
  }
});

router.post("/:playerName", async (req, res) => {
  console.log(req.params.playerName);

  const game = await clue.find({
    playerName: req.params.playerName,
  });

  console.log(game);

  if (game.length !== 0) {
    return res.status(404).json({ message: "Game already exists" });
  }

  let cg = new clue(initialState);
  cg.playerName = req.params.playerName;
  cg.player.name = req.params.playerName;

  try {
    const newGame = await cg.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const clue = await clue.findById(id);

    if (!clue) {
      return res.status(404).json({ message: "Game not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (clue[key] !== undefined) {
        clue[key] = updates[key];
      }
    });

    const updatedGame = await clue.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
